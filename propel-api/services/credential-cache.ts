import { db } from "../core/database";
import { DataService } from "../services/data-service";
import { Workflow } from "../../propel-shared/models/workflow";
import { Credential } from "../../propel-shared/models/credential";
import { Secret } from "../../propel-shared/models/secret";
import { SecretValue } from "../../propel-shared/models/secret-value";
import { QueryModifier } from "../../propel-shared/core/query-modifier";
import { PropelError } from "../../propel-shared/core/propel-error";
import { POWERSHELL_NULL_LITERAL } from "../../propel-shared/utils/utils";

/**
 * Temporal cache of credentials, including also the secrets.
 * This cache is intended to store all the credentials referenced by a Workflow in both
 * target credentials and Propel variables.
 */
export class CredentialCache {

    private _cache!: Map<string, CredentialCacheItem>;
    private _secretStrings!: string[];

    /**
     * Amount of elements in cache.
     */
    get count(): number {
        return this._cache.size;
    }

    /**
     * Returns a list of all the sensitive data including in all the secret part of all the 
     * credentials stored in this cache.
     * This is intended to be usong for data scrubbing in logging processes.
     */
    get allSecretStrings(): string[] {
        return Array.from(this._secretStrings);
    }

    constructor() {
        this.initializeCache();
    }

    /**
     * Build the cache with the complete list of Credentials and his Secret values required by the specified 
     * Workflow.
     * @param workflow Workflow.
     */
    async build(workflow: Workflow): Promise<void> {
        let credentialIds: Set<string> = new Set<string>();
        let secretIds: Set<string> = new Set<string>();
        let credentials: Credential[] = [];
        let secrets: Secret<SecretValue>[] = [];

        workflow.steps.map((step) => {

            //1st - Gather all the credential names in Propel parameters:
            //===========================================================

            step.script.parameters.forEach((param) => {
                //If the parameter is a Propel parameter the value will be the list 
                //of credentials to retrieve:
                if (param.isPropelParameter) {
                    //Need to look in the collection of parameter values for that parameter:
                    step.values.map((pv) => {
                        if (pv.name == param.name) {
                            //The values will be a comma separated list of all the credentials 
                            //set in the Propel parmeter, (if any):
                            if (pv.value && pv.value != POWERSHELL_NULL_LITERAL) {
                                pv.value
                                    .split(",")
                                    .map((id) => credentialIds.add(String(id).trim())) //Set is preventing to add duplicates.
                            }
                        }
                    })
                }
            })

            //2nd - Gather all the credentials names in all the Targets, (used to invoke):
            //============================================================================

            step.targets.map((t) => {
                if (t.invokeAs) {
                    //If the credential is in the list, (because is already specified by a 
                    //$PropelCredentials parameter), we remove it from the list to be fetched from the DB:
                    if (credentialIds.has(t.invokeAs._id)) {
                        credentialIds.delete(t.invokeAs._id)
                    }

                    credentials.push((t.invokeAs as any).toObject());
                }
            })
        })

        //3rd - To fetch all the Credentials referred in this Workflow that has not been fetched yet:
        //===========================================================================================
        if (credentialIds.size > 0) {

            let fetchedCreds = await this.getCredentialsById(Array.from(credentialIds))
            credentials.push(...fetchedCreds);

            //Verifying the count, throwing if not match:
            if (credentialIds.size != fetchedCreds.length) {
                throw new PropelError(`There was a total of ${credentialIds.size} credentials specified in one or ` +
                    `more Propel parameters in all the scripts of this workflow. But we found only ${fetchedCreds.length} of them.\r\n` +
                    `Credentials specified: "${Array.from(credentialIds).join()}", ` +
                    `Credentials found: "${fetchedCreds.map((cred) => `${cred.name} (${cred._id})`).join()}".`)
            }
        }

        //4th - To fetch all the Secrets for all the credentials:
        //===========================================================

        credentials.forEach((cred) => {
            secretIds.add(cred.secretId);
        })

        if (secretIds.size > 0) {

            secrets = await this.getSecretsById(Array.from(secretIds));

            //Verifying the count, throwing if not match:
            if (secretIds.size != secrets.length) {
                throw new PropelError(`There is a total of ${secretIds.size} credentials specified for this Workflow, ` +
                    `but we found the secret part for only ${secrets.length} of them. Please check the credentials specified in the targets and also in any $PropelCredentials parameter in a script.\r\n` +
                    `Secret IDs specified: "${Array.from(secretIds).join()}", ` +
                    `Secret IDs found: "${secrets.map((vi) => vi._id).join()}".`)
            }
        }

        //5th - Build the map:
        //====================

        this.initializeCache()

        credentials.forEach((credential) => {
            let secret = (secrets.find((vi) => vi._id == credential.secretId) as Secret<SecretValue>);
            this._cache.set(credential._id.toString(), new CredentialCacheItem(credential, secret));

            Object.getOwnPropertyNames(secret.value).forEach((key: string) => {
                this._secretStrings.push((secret.value as any)[key]);
            });
        })
    }

    /**
     * Search the cache for the specified credential name and return a CredentialCacheItem if found.
     * @param credentialId Credential identifier to search for.
     * @returns a *CredentialCacheItem* if found, otherwise *undefined*.
     */
    getById(credentialId: string): CredentialCacheItem | undefined {
        return this._cache.get(credentialId)
    }

    /**
     * Init/Reset the cache and the secret strings list.
     */
    private initializeCache(): void {
        this._cache = new Map<string, CredentialCacheItem>();
        this._secretStrings = [];
    }

    private async getSecretsById(secretIds: string[]): Promise<Secret<SecretValue>[]> {

        let svc: DataService = db.getService("Secret");
        let qm = new QueryModifier();

        qm.filterBy = {
            _id: {
                $in: secretIds
            }
        };

        return (await svc.find(qm)).data
            .map((model) => model.toObject());
    }

    private async getCredentialsById(credentialIds: string[]): Promise<Credential[]> {

        let svc: DataService = db.getService("Credential");
        let qm = new QueryModifier();

        qm.filterBy = {
            _id: {
                $in: credentialIds
            }
        };

        return (await svc.find(qm)).data
            .map((model) => model.toObject());
    }
}

/**
 * Item stored in the Credential Cache. Each item holds a reference to the credential and 
 * his secret part.
 */
export class CredentialCacheItem {

    /**
     * Credential
     */
    public readonly credential: Credential;

    /**
     * Secret part of the credential, usually holding user names, API Keys, passwords, etc.
     */
    public readonly secret: Secret<SecretValue>;

    constructor(credential: Credential, secret: Secret<SecretValue>) {
        this.credential = credential;
        this.secret = secret
    }
}