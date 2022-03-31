import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APIResponse } from '../../../propel-shared/core/api-response';
import { UserAccount } from '../../../propel-shared/models/user-account';
import { UserAccountRolesUtil } from '../../../propel-shared/models/user-account-roles';
import { Observable } from 'rxjs';
import { logger } from '../../../propel-shared/services/logger-service';
import { environment } from 'src/environments/environment';

const enum SecurityEndpointActions {
    SaveUser = "save",
    GetUser = "user",
    ResetUserPassword = "reset",
    LockUser = "lock",
    UnlockUser = "unlock"
}

/**
 * This class help manage every aspect of user security, user authentication and authorization.
 */
@Injectable({
    providedIn: 'root'
})
export class SecurityService {

    constructor(private http: HttpClient) {
        logger.logInfo("SecurityService instance created");
    }

    /**
     * Lock the user in order to prevent his next login attempt.
     * 
     * @param userId Identifier of the user to lock
     * @returns The user ID if the locking was successful
     */
    lockUser(userId: string): Observable<APIResponse<string>> {
        let url: string = this.buildURL(SecurityEndpointActions.LockUser, userId);
        
        return this.http.post<APIResponse<string>>(url, null, { headers: this.buildHeaders() });
    }

    /**
     * Unlock the user specified in order to allow him to login.
     * 
     * @param userId Identifier of the user to lock
     * @returns The user ID if the locking was successful
     */
    unlockUser(userId: string): Observable<APIResponse<string>> {
        let url: string = this.buildURL(SecurityEndpointActions.UnlockUser, userId);
        
        return this.http.post<APIResponse<string>>(url, null, { headers: this.buildHeaders() });
    }

    /**
     * Reset the user password so a new one will be requested during the next login.
     * @param userId User identifier
     * @returns The same user ID if the reset was successful.
     */
    resetPassword(userId: string): Observable<APIResponse<string>> {
        let url: string = this.buildURL(SecurityEndpointActions.ResetUserPassword, userId);
        
        return this.http.post<APIResponse<string>>(url, null, { headers: this.buildHeaders() });
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

    /**
     * Retieves the specified user account
     * @param userIdOrName User ID or name, (The name of the user is equally unique as the id).
     * @returns The user account if exists.
     */
    getUser(userIdOrName: string): Observable<APIResponse<UserAccount>> {
        let url: string = this.buildURL(SecurityEndpointActions.GetUser, userIdOrName);
        
        return this.http.get<APIResponse<UserAccount>>(url, { headers: this.buildHeaders() });
    }

    /**
     * Persist, (create or update) the specified user account.
     * @param user User acount with the updates.
     * @returns The useraccount id if no error.
     */
    saveUser(user: UserAccount): Observable<APIResponse<string>> {
        let url: string = this.buildURL(SecurityEndpointActions.SaveUser);
        
        return this.http.post<APIResponse<string>>(url, user, { headers: this.buildHeaders() });       
    }

    private buildURL(action: SecurityEndpointActions, param: string = "") {

        if (param && !param.startsWith("/")) {
            param = `/${param}`;
        }

        return `http://${environment.api.url}${environment.api.endpoint.security}${action.toString().toLowerCase()}${param}`
    }

    private buildHeaders(): HttpHeaders {
        let ret: HttpHeaders = new HttpHeaders()
            .set("Content-Type", "application/json");

        // To add other headers: 
        //ret = ret.append("New header", "value");

        return ret;
    }
}