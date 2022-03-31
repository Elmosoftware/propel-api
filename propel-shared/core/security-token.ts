import { UserAccount } from "../models/user-account";
import { UserAccountRoles, UserAccountRolesUtil } from "../models/user-account-roles";
import { PropelError } from "./propel-error";

export class SecurityToken {

    /**
     * User unique identifier.
     */
    public userId!: string;

    /**
     * Account name. This is also a unique account identifier.
     */
    public userName!: string;

    /**
     * User full name
     */
    public userFullName!: string;

    /**
     * User initials, for user avatar, picture subtext, etc. 
     */
    public userInitials!: string;

    /**
     * User Email. This will be used as the unique user identifier.
     */
    public userEmail!: string;

    /**
     * User role.
     */
    public role!: UserAccountRoles;

    /**
     * Boolean value that indicates if the current user role is and Administrator role.
     */
    public roleIsAdmin!: boolean

    /**
     * Constructor. Requires a valid User account.
     * @param user The user account that own the token.
     */
    constructor(user: UserAccount) {
        if (!user) throw new PropelError(`The constructor parameter "user" can't be a null reference.`)

        this.userId = user._id;
        this.userName = user.name;
        this.userFullName = user.fullName;
        this.userInitials = user.initials;
        this.userEmail = user.email;
        this.role = user.role;
        this.roleIsAdmin = UserAccountRolesUtil.IsAdmin(user.role);
    }
}
