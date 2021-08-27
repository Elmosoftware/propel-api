// @ts-check
import { AuditedEntity } from "./audited-entity";
import { CredentialTypes, DEFAULT_CREDENTIAL_TYPE } from "./credential-types";
import { ParameterValue } from "./parameter-value";

/**
 * Security credentials base class.
 */
export class Credential extends AuditedEntity {

    /**
     * Unique name for the credential.
     */
    public name: string = ""

    /**
     * Unique name for the credential.
     */
    public type: CredentialTypes = DEFAULT_CREDENTIAL_TYPE

    /**
     * Credential description, purpose, details, etc.
     */
    public description: string = ""

    /**
     * Propel Secret Vault id.
     */
    public vaultId: string = "";

    /**
    * Additional fields. This is extra data, (non-sensitive), added to the credential that will 
    * be passed on to the script on runtime.
    */
    public fields: ParameterValue[] = [];

    constructor() {
        super();
    }
}
