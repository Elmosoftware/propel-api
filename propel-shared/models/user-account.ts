import { AuditedEntity } from "./audited-entity";
import { UserAccountRoles, DEFAULT_USER_ROLE } from "./user-account-roles";

export class UserAccount extends AuditedEntity {

    /**
     * Account name. This is an unique account identifier, can be mapped with a OS user name.
     */
    public name: string = "";

    /**
     * User full name
     */
    public fullName: string = "";

    /**
     * User initials, for user avatar, picture subtext, etc. 
     */
    public initials: string = "";

    /**
     * User Email. This will be used as the unique user identifier.
     */
    public email: string = "";

    /**
     * Propel Secret id. It will hold a document with a password hash.
     */
    public secretId: string = "";

    /**
     * User role.
     */
    public role: UserAccountRoles = DEFAULT_USER_ROLE;

    /**
     * Timestamp for the last time the user change his password.
     */
    public lastPasswordChange: Date | null = null;

    /**
     * Timestamp for the last user login.
     */
    public lastLogin: Date | null = null;

    /**
     * Indicates if the user must reset his password on his next login.
     */
    public mustReset: boolean = false;

    /**
     * Indicates if the user can login or not.
     */
    public lockedSince: Date | null = null;

    constructor() {
        super();
    }
}