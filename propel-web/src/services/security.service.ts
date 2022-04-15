import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { APIResponse } from '../../../propel-shared/core/api-response';
import { UserAccount } from '../../../propel-shared/models/user-account';
import { UserAccountRolesUtil } from '../../../propel-shared/models/user-account-roles';
import { UserRegistrationResponse } from '../../../propel-shared/core/user-registration-response';
import { SecurityRequest } from '../../../propel-shared/core/security-request';
import { SecurityToken } from '../../../propel-shared/core/security-token';
import { SecuritySharedConfiguration } from '../../../propel-shared/core/security-shared-config';
import { Observable } from 'rxjs';
import { logger } from '../../../propel-shared/services/logger-service';
import { environment } from 'src/environments/environment';
import { PropelAppError } from 'src/core/propel-app-error';
import { SystemHelper } from 'src/util/system-helper';
import { Utils } from '../../../propel-shared/utils/utils';

const enum SecurityEndpointActions {
    GetConfiguration = "",
    SaveUser = "save",
    GetUser = "user",
    ResetUserPassword = "reset",
    LockUser = "lock",
    UnlockUser = "unlock",
    Login = "login"
}

/**
 * This class help manage every aspect of user security, user authentication and authorization.
 */
@Injectable({
    providedIn: 'root'
})
export class SecurityService {

    private _config: SecuritySharedConfiguration;
    private _securityToken: SecurityToken;

    constructor(private http: HttpClient) {
        logger.logInfo("SecurityService instance created");
        this.refreshConfig()
            .subscribe((results: APIResponse<SecuritySharedConfiguration>) => {
                logger.logInfo("SecurityService configuration cached successfully");
            })
    }

    /**
     * Returns the security configuration.
     */
    get config(): SecuritySharedConfiguration {
        return Object.assign({}, this._config);
    }

    /**
     * Returns a boolean value indicating if there is a user already sign in.
     */
    get IsUserLoggedIn(): boolean {
        return Boolean(this._securityToken);
    }

    /**
     * Returns all the session details including information about the user, token expiration, etc.
     */
    get sessionDetails(): SecurityToken {
        return Object.assign({}, this._securityToken);
    }

    /**
     * Fetch the current security configuration between backend and frontend.
     */
    refreshConfig(): Observable<APIResponse<SecuritySharedConfiguration>> {
        let url: string = this.buildURL(SecurityEndpointActions.GetConfiguration);

        return this.http.get<APIResponse<SecuritySharedConfiguration>>(url, { headers: this.buildHeaders() })
            .pipe(
                map((results: APIResponse<SecuritySharedConfiguration>) => {
                    this._config = results.data[0];
                    return results;
                })
            )
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
    resetPassword(userId: string): Observable<APIResponse<UserRegistrationResponse>> {
        let url: string = this.buildURL(SecurityEndpointActions.ResetUserPassword, userId);

        return this.http.post<APIResponse<UserRegistrationResponse>>(url, null, { headers: this.buildHeaders() });
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
     * Retrieves the specified user account
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
    saveUser(user: UserAccount): Observable<APIResponse<UserRegistrationResponse>> {
        let url: string = this.buildURL(SecurityEndpointActions.SaveUser);

        return this.http.post<APIResponse<UserRegistrationResponse>>(url, user, { headers: this.buildHeaders() });
    }

    /**
     * User login process.
     * @param sr SecurityRequest including all the infoneded for the user login process.
     * @returns A JWT token.
     */
     login(sr: SecurityRequest): Observable<APIResponse<string>> {
        let url: string = this.buildURL(SecurityEndpointActions.Login);

        return this.http.post<APIResponse<string>>(url, sr, { headers: this.buildHeaders() })
        .pipe(
            map((results: APIResponse<string>) => {
                //TODO: HERE  STORE THE TOKEN and the user details!!!
                this.finishLoginProcess(results.data[0]);
                return results;
            })
        )
    }

    private finishLoginProcess(token: string): void {
        let tokenSections: string[] = token.split(".")
        let tokenPayload: any;

        if (tokenSections.length !== 3) throw new PropelAppError(`Invalid token. 
The provided JWT token is not properly formatted. We expect Header, Payload and Signature sections and we get ${tokenSections.length} sections.`);

        tokenPayload = SystemHelper.decodeBase64(tokenSections[1]);

        if (Utils.isValidJSON(tokenPayload)) {
            
        }
        else throw new PropelAppError(`Invalid token payload. 
The payload in the provided JWT token can't be parsed as JSON. Payload content is: ${tokenPayload} sections.`);
        
        this._securityToken = new SecurityToken();
        this._securityToken.hydrateFromTokenPayload(JSON.parse(tokenPayload));
        this._securityToken.accessToken = token;        
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