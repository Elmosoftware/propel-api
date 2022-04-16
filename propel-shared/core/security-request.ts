
export class SecurityRequest {

    /**
     * User name.
     */
    userName: string = "";

    /**
     * User password to validate.
     */
    password: string = "";

    /**
     * New User password. This attribute will contain the new user password when a password reset occurs.
     */
    newPassword: string = "";

    constructor() {
    }
}
