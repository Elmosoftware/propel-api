import { Injectable } from '@angular/core';
import { APIResponse } from '../../../propel-shared/core/api-response';
import { UserAccount } from '../../../propel-shared/models/user-account';
import { UserAccountRolesUtil } from '../../../propel-shared/models/user-account-roles';

import { logger } from '../../../propel-shared/services/logger-service';
import { DataEntity, DataService } from './data.service';

/**
 * This class help manage every aspect of user security, user authentication and authorization.
 */
@Injectable({
    providedIn: 'root'
})
export class SecurityService {

    constructor(private data: DataService) {
        logger.logInfo("SecurityService instance created");
    }

    /**
     * Lock the user in order to prevent his next login attempt.
     * 
     * @param userId Identifier of the user to lock
     * @returns The user ID if the locking was successful
     */
    async lockUser(userId: string): Promise<APIResponse<string>> {
        return this.toggleLock(userId, true);
    }

    /**
     * Unlock the user specified in order to allow him to login.
     * 
     * @param userId Identifier of the user to lock
     * @returns The user ID if the unlocking was successful
     */
    async unlockUser(userId: string) {
        return this.toggleLock(userId, false);
    }

    /**
     * Reset the user password so a new one will be requested during the next login.
     * @param userId User identifier
     * @returns The same user ID if the reset was successful.
     */
    async resetPassword(userId: string) {

        try {
            let user = await this.getUser(userId);

            //If the user still not have a secret set, means he/she didn't set the password yet, 
            //so there is no point mark the record for reset:
            if (this.passwordCanBeResetted(user)) {
                user.mustReset = true;
                return this.data.save(DataEntity.UserAccount, user).toPromise();
            }
            else {
                //Will take as a succesful op even when no reset occur:
                return Promise.resolve(new APIResponse<string>(null,userId)); 
            }       
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * Return a boolean value indicating if the provided user is locked.
     * @param user User account
     * @returns A boolean value indicating if the provided user is locked.
     */
    userIsLocked(user: UserAccount): boolean {
        return Boolean(user.lockedSince);
    }

    /**
     * Return a boolean value indicating if the provided user has an Admin role assigned.
     * @param user User account
     * @returns A boolean value indicating if the user is an administretor.
     */
    userIsAdmin(user: UserAccount): boolean {
        return UserAccountRolesUtil.IsAdmin(user.role);
    }

    /**
     * Returns a bolean value indicating in the user password can be reset.
     * @param user User 
     * @returns A boolean value indicating if the user password can be reset.
     */
    passwordCanBeResetted(user: UserAccount): boolean {
        //If the user still not have a secret set, means he/she didn't login and set the password yet, 
        //so there is no point to mark the record for reset. 
        //The same case if the "mustReset" flag is already set:
        return (user.secretId && !user.mustReset);
    }

    private async getUser(userId:string): Promise<UserAccount> {

        let ret: UserAccount;

        try {
            let result = await this.data.getById(DataEntity.UserAccount, userId).toPromise();
            ret = (result.data[0] as UserAccount);
        }
        catch (err) {
            throw err;
        }

        return ret;
    }

    private async toggleLock(userId: string, lockRequested: boolean) {

        try {
            let user = await this.getUser(userId);
            let persist: boolean = false

            //If we must lock the user and the user isnot locked yet:
            if (lockRequested && !this.userIsLocked(user)) {
                user.lockedSince = new Date();
                persist = true;
            }
            //If we must unlock the user and the user is already locked:
            else if (!lockRequested && this.userIsLocked(user)) {
                user.lockedSince = null;
                persist = true;
            }

            if (persist) {
                return this.data.save(DataEntity.UserAccount, user).toPromise();
            }
            else{
                //If the user is already in the expected lock status, we will do nothing:
                return Promise.resolve(new APIResponse<string>(null,userId));
            }
        }
        catch (err) {
            throw err;
        }
    }
}