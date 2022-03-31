import { SecretValue } from "./secret-value";

/**
 * This holds the secret part of a Propel user account.
 */
export class UserAccountSecret extends SecretValue{

    /**
     * User password hash.
     */
     passwordHash: string = "";

    constructor() {
        super();
    }
}