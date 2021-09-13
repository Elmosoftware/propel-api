import { db } from "../core/database";
import { DataService } from "../services/data-service";
import { Workflow } from "../../propel-shared/models/workflow";
import { Credential } from "../../propel-shared/models/credential";
import { Vault } from "../../propel-shared/models/vault";
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
     * Build the cache with the complete list of Credentials and Vault Items required by specified 
     * Workflow.
     * @param workflow Workflow.
     */
    async build(workflow: Workflow): Promise<void> {
        let credentialIds: Set<string> = new Set<string>();
        let vaultItemIds: Set<string> = new Set<string>();
        let credentials: Credential[] = [];
        let vaultItems: Vault<any>[] = [];

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

        //4th - To fetch all the Vault items for all the credentials:
        //===========================================================

        credentials.forEach((cred) => {
            vaultItemIds.add(cred.vaultId);
        })

        if (vaultItemIds.size > 0) {

            // try {
                vaultItems = await this.getVaultItemsById(Array.from(vaultItemIds));
            // } catch (error) {


                // throw error?.errors[0] //?.errorCode?.key == ErrorCodes.CryptoError.key) {
            // }

            //Verifying the count, throwing if not match:
            if (vaultItemIds.size != vaultItems.length) {
                throw new PropelError(`There is a total of ${vaultItemIds.size} credentials specified for this Workflow, ` +
                    `but we found only ${vaultItems.length} credential secret parts. Please check the credentials specified in the targets and $PropelCredentials parameters.\r\n` +
                    `Vault Item IDs specified: "${Array.from(vaultItemIds).join()}", ` +
                    `Vault Item IDs found: "${vaultItems.map((vi) => vi._id).join()}".`)
            }
        }

        //5th - Build the map:
        //====================

        this.initializeCache()

        credentials.forEach((credential) => {
            let vaultItem = (vaultItems.find((vi) => vi._id == credential.vaultId) as Vault<any>);
            this._cache.set(credential._id.toString(), new CredentialCacheItem(credential, vaultItem));

            Object.getOwnPropertyNames(vaultItem.value).forEach((key: string) => {
                this._secretStrings.push(vaultItem.value[key]);
            });
        })
    }

    /**
     * Search the cache for the specified credential name and retur a CredentialCacheItem if found.
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

    private async getVaultItemsById(vaultIds: string[]): Promise<Vault<any>[]> {

        let svc: DataService = db.getService("Vault");
        let qm = new QueryModifier();

        qm.filterBy = {
            _id: {
                $in: vaultIds
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
    public readonly vaultItem: Vault<any>;

    constructor(credential: Credential, vaultItem: Vault<any>) {
        this.credential = credential;
        this.vaultItem = vaultItem
    }
}