/**
 * User account roles enumeration.
 */
export enum UserAccountRoles {
    Administrator = "Admin",
    User = "User"
}

/**
 * Default user account role.
 */
export let DEFAULT_USER_ROLE = UserAccountRoles.User