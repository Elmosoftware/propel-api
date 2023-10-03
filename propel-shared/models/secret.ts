import { PropelError } from "../core/propel-error";
import { AuditedEntity } from "./audited-entity";
import { Credential } from "./credential";
import { CredentialTypes } from "./credential-types";
import { SecretValue } from "./secret-value";
import { WindowsSecret } from "./windows-secret";
import { AWSSecret } from "./aws-secret";
import { GenericAPIKeySecret } from "./generic-apikey-secret";
import { DatabaseSecret } from "./database-secret";

/**
 * Propel Secret.
 * Intended to store user credentials, API keys, etc. 
 * If you want to create a secret from the MySecret class you must instantiate passing the type 
 * name in the constructor, like this:
 * @example
 * let mySecret = new Secret<MySecretValue>(MySecretValue);
 */
export class Secret<T extends SecretValue> extends AuditedEntity {

    /**
     * Secret value that will be stored encrypted.
     */
    public value: T;

    constructor(type: (new () => T)) {
        super();
        this.value = new type();
    }
}

/**
 * Factory to create Secret instances starting from a credential.
 */
export class SecretFactory {

    /**
     * This method create a new Secret instance of the right type based on the 
     * credential type attribute.
     * @param credential Credential that will own the Secret.
     * @returns a Secret of the type required by the credential.
     */
    static createFromCredential(credential: Credential): Secret<SecretValue> {

        let ret: Secret<SecretValue>;

        if (!credential) throw new PropelError(`We expect a valid Credential. the parameter "credential" is a null reference.`);
        if (!credential.credentialType) throw new PropelError(`The Credential instance doesn't have a valid CredentialType assigned."credentialType" attribute value: "${String(credential.credentialType)}".`);

        switch (credential.credentialType) {
            case CredentialTypes.AWS:
                ret = new Secret<AWSSecret>(AWSSecret);
                break;
            case CredentialTypes.APIKey:
                ret = new Secret<GenericAPIKeySecret>(GenericAPIKeySecret);
                break;
            case CredentialTypes.Database:
                ret = new Secret<DatabaseSecret>(DatabaseSecret);
                break;
            default:
                ret = new Secret<WindowsSecret>(WindowsSecret);
        }

        return ret;
    }
}