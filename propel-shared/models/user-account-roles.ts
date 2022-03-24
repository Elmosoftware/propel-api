/**
 * User account roles enumeration.
 */
export enum UserAccountRoles {
    Administrator = "Administrator",
    User = "User"
}

/**
 * Default user account role.
 */
export let DEFAULT_USER_ROLE = UserAccountRoles.User

/**
 * Utility methods to operate with User roles.
 */
export class UserAccountRolesUtil {
    constructor() {
    }

    /**
     * Returns a boolen value indicating if the provided role is an administrator role.
     * @param role User role
     * @returns A boolen value that indicates if the role is an admin role.
     */
    static IsAdmin(role: UserAccountRoles): boolean {
        return (role == UserAccountRoles.Administrator);
    }
}
