import { Utils } from "../utils/utils";

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

    /**
     * Return a list of all the defined roles.
     * @returns All the defined roles.
     */
    static getAllRoles(): UserAccountRoles[] {
        let ret: UserAccountRoles[] = []
        
        Utils.getEnum(UserAccountRoles)
        .map((item: { key: string; value: string | number; }) => {
            ret.push((UserAccountRoles as any)[item.key])
        })

        return ret;
    }
}
