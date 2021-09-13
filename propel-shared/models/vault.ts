import { PropelError } from "../core/propel-error";
import { AuditedEntity } from "./audited-entity";
import { Credential } from "./credential";
import { CredentialTypes } from "./credential-types";
import { WindowsVaultItem } from "./windows-vault-item";
import { AWSVaultItem } from "./aws-vault-item";

/**
 * Propel Secret Vault.
 * Intended to store user credentials, API keys, etc. 
 * If you want to create avault from the MySecret class you must instantiate passing the type 
 * name in the constructor, like this:
 * @example
 * let myVault = new Vault<MySecret>(MySecret);
 */
export class Vault<T> extends AuditedEntity {

    /**
     * Secret value to be stored in the vault.
     * The value will be stored encrypted.
     */
    public value: T;

    constructor(type: (new () => T)) {
        super();
        this.value = new type();
    }
}

/**
 * factory to create Vault Item instances starting from a credential.
 */
export class VaultItemFactory {

    /**
     * This method create a new Vault item instance of the right type based on the 
     * credential type attribute.
     * @param credential Credential that will own the Vault item.
     * @returns a Vault item of the type specified by the credential.
     */
    static createFromCredential(credential: Credential): Vault<any> {

        let ret: Vault<any>;

        if (!credential) throw new PropelError(`We expect a valid Credential. the parameter "credential" is a null reference.`);
        if (!credential.type) throw new PropelError(`The Credential instance doesn't have a valid CredentialType assigned."type" attribute value: "${String(credential.type)}".`);

        switch (credential.type) {
            case CredentialTypes.AWS:
                ret = new Vault<AWSVaultItem>(AWSVaultItem);
                break;
            default:
                ret = new Vault<WindowsVaultItem>(WindowsVaultItem);
        }

        return ret;
    }
}
