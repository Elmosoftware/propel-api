import { AuditedEntity } from "./audited-entity";

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
