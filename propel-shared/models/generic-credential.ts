import { CredentialBase } from "./credential-base";
import { CredentialTypes } from "./credential-types";

/**
 * A generic credential is holding a user and password and optionally a domain name
 */
export class GenericCredential extends CredentialBase {

    secret: GenericSecret = new GenericSecret()

    constructor() {
        super();
        this.type = CredentialTypes.Generic;
    }
}

/**
 * A generic credential secret stores a user name, his password and optionallya domain name.
 */
export class GenericSecret {

    /**
     * User name.
     */
    userName: string = "";

    /**
     * Domain.
     */
    domain: string = "";

    /**
     * User password.
     */
    password: string = "";

    constructor() {

    }
}