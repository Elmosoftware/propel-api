
export class SecuritySharedConfiguration {

    /**
     * Authorization code length.
     */
    authCodeLength: number = 0;

    /**
     * Password minimum length.
     */
    passwordMinLength: number = 0;

    /**
     * Password minimum length.
     */
    passwordMaxLength: number = 0;

    /**
     * Indicate if legacy security is enabled in Propel. This is for backward compatibility only.
     * User security will be automatically turned off as soon at least one user account 
     * with Administrator role is added and logged in successfully.
     */
    legacySecurity: boolean = false;

    constructor() {
    }
}
