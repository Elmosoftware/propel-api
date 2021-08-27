/**
 * A Windows credential that stores a user name, his password and optionally a domain name.
 */
 export class WindowsVaultItem {

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
