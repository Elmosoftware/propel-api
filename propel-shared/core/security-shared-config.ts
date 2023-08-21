
export class SecuritySharedConfiguration {

    /**
     * Indicate if legacy security is enabled in Propel. This is for backward compatibility only.
     * User security will be automatically turned off as soon at least one user account 
     * with Administrator role is added and logged in successfully.
     */
    legacySecurity: boolean = false;

    constructor() {
    }
}
