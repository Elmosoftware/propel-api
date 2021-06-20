/**
 * Define the options for user impersonation to perform during script executions.
 * This optiona can allow to execute remote scripts with specific credentials.
 */
export class ImpersonateOptions {

    constructor(private env: any) {
    }

    /**
    * Indicates if the impersonation is enabled.
    */
    get enabled(): boolean {
        return (this.env.IMPERSONATE.toLowerCase() == 'true');
    }

    /**
     * Retrieves the user name.
     * If the impersonation is disabled or the user was not specified this property will return an empty string.
     * If a Domain was specified in the configuration, this property is going to include it in the form "Domain\User"
     */
    get user(): string {
        let ret: string = ""

        if(!this.enabled) return ret;
        if(!this.env.IMPERSONATE_USER) return ret;

        if(this.env.IMPERSONATE_DOMAIN) {
            ret += `${this.env.IMPERSONATE_DOMAIN}\\`
        }

        ret += this.env.IMPERSONATE_USER;

        return ret;
    }

    /**
     * Retrieves the user password.
     */
    get password(): string {
        let ret: string = ""

        if(!this.enabled) return ret;
        if(!this.env.IMPERSONATE_USER) return ret;

        ret += this.env.IMPERSONATE_PASSWORD;

        return ret;
    }
}
