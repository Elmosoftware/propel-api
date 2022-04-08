
export class UserRegistrationResponse {

    /**
     * User identifier.
     */
    userId: string = "";

    /**
     * Secret identifier.
     */
    secretId: string = "";

    /**
     * Authentication code.
     * This will be filled only for user registration (new user), or when a password is 
     * reset by a System admin.
     */
    authCode: string = "";

    constructor() {
    }
}
