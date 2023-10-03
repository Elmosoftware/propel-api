import { SecretValue } from "./secret-value";

/**
 * A Windows credential that stores a user name, his password and optionally a domain name.
 */
 export class DatabaseSecret extends SecretValue {

    /**
     * User ID/Name.
     */
    user: string = "";

    /**
     * User password.
     */
    password: string = "";

    constructor() {
        super();
    }
}
