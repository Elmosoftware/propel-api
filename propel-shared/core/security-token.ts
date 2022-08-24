import { UserAccount } from "../models/user-account";
import { DEFAULT_USER_ROLE, UserAccountRoles, UserAccountRolesUtil } from "../models/user-account-roles";

export type TokenPayload = { data: SecurityToken, iat: number, exp: number }
export const BEARER_PREFIX: string = "Bearer "
export const ACCESS_TOKEN_QUERYSTRING_KEY: string = "access_token"

export class SecurityToken {

    /**
     * User unique identifier.
     */
    public userId: string = "";

    /**
     * Account name. This is also a unique account identifier.
     */
    public userName: string = "";

    /**
     * User full name
     */
    public userFullName: string = "";

    /**
     * User initials, for user avatar, picture subtext, etc. 
     */
    public userInitials: string = "";

    /**
     * User Email. This will be used as the unique user identifier.
     */
    public userEmail: string = "";

    /**
     * User role.
     */
    public role: UserAccountRoles = DEFAULT_USER_ROLE;

    /**
     * Indicates if the user role is an Administrator role.
     */
    public roleIsAdmin: boolean = false;

    /**
     * iat
     */
    public issuedAt: Date = new Date();

    /**
     * exp
     */
    public expiresAt?: Date;

    /**
     * The provided access token.
     */
    public accessToken: string = "";

    /**
     * Indicate if legacy security is enabled in Propel. This is for backward compatibility only.
     * User security will be automatically turned off as soon at least one user account 
     * with Administrator role is added and logged in successfully.
     */
    public legacySecurity: boolean = false;

    constructor(expirationMinutes?: number) {
        if (expirationMinutes && !isNaN(parseInt(String(expirationMinutes)))) {
            expirationMinutes = parseInt(String(expirationMinutes))
            this.expiresAt = new Date(this.issuedAt.getTime() + (1000 * 60 * expirationMinutes))
        }
    }

    /**
     * Hydrate the Security token details from the supplied user account. 
     * @param user User account.
     */
    hydrateFromUser(user: UserAccount) {
        this.userId = user._id;
        this.userName = user.name;
        this.userFullName = user.fullName;
        this.userInitials = user.initials;
        this.userEmail = user.email;
        this.role = user.role;
        this.roleIsAdmin = UserAccountRolesUtil.IsAdmin(this.role);
    }

    /**
     * Hydrate the security token from the user data contained in a existing token.
     * @param tokenPayload Token payload.
     * @param accessToken Access token.
     */
    hydrateFromTokenPayload(tokenPayload: { data: SecurityToken, iat: number, exp: number }, accessToken: string = "") {
        this.userId = tokenPayload.data.userId
        this.userName = tokenPayload.data.userName
        this.userFullName = tokenPayload.data.userFullName
        this.userInitials = tokenPayload.data.userInitials
        this.userEmail = tokenPayload.data.userEmail
        this.role = tokenPayload.data.role;
        this.roleIsAdmin = UserAccountRolesUtil.IsAdmin(this.role);
        this.legacySecurity = tokenPayload.data.legacySecurity;

        this.issuedAt = new Date(tokenPayload.iat * 1000);

        if (tokenPayload.exp) {
            this.expiresAt = new Date(tokenPayload.exp * 1000);
        }
        else {
            this.expiresAt = tokenPayload.data.expiresAt;
        }

        this.accessToken = (tokenPayload.data.accessToken) ? tokenPayload.data.accessToken : accessToken;
    }
}
