import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { catchError, map, tap } from 'rxjs/operators';
import { RuntimeInfo } from '../../../propel-shared/core/runtime-info';
import { UserLoginResponse } from '../../../propel-shared/core/user-login-response';
import { UserAccount } from '../../../propel-shared/models/user-account';
import { UserAccountRolesUtil } from '../../../propel-shared/models/user-account-roles';
import { UserRegistrationResponse } from '../../../propel-shared/core/user-registration-response';
import { SecurityRequest } from '../../../propel-shared/core/security-request';
import { TokenRefreshRequest } from '../../../propel-shared/core/token-refresh-request';
import { SecurityToken } from '../../../propel-shared/core/security-token';
import { SecuritySharedConfiguration } from '../../../propel-shared/core/security-shared-config';
import { of, throwError } from 'rxjs';
import { logger } from '../../../propel-shared/services/logger-service';
import { environment as env } from 'src/environments/environment';
import { RDPUser } from '../../../propel-shared/core/rdp-user';
import { ErrorCodes } from '../../../propel-shared/core/error-codes';
import { PageMetadata } from './app-pages.service';
import { SessionService } from './session.service';
import { PropelError } from '../../../propel-shared/core/propel-error';
import { Headers, HttpHelper } from 'src/util/http-helper';

/**
 * This header indicates that no Authorization data is needed to be sent for the request.
 */
export const X_HEADER_NOAUTH = "x-propel-noauth"
export const SecurityEndpoint: string = "security";

export const enum SecurityEndpointActions {
    SaveUser = "save",
    GetUser = "user",
    ResetUserPassword = "reset",
    LockUser = "lock",
    UnlockUser = "unlock",
    Login = "login",
    Refresh = "refresh",
    Logoff = "logoff"
}

export const enum SecurityEvent {
    Login,
    Logoff
}

/**
 * This class help manage every aspect of user security, user authentication and authorization.
 */
@Injectable({
    providedIn: 'root'
})
export class SecurityService {

    private _session: SessionService;
    private _securityEvent$: EventEmitter<SecurityEvent> = new EventEmitter<SecurityEvent>();

    constructor(private http: HttpClient) {
        logger.logInfo("SecurityService instance created");
        this._session = new SessionService();
    }

    /**
     * Returns a boolean value indicating if there is a user already sign in.
     */
    get isUserLoggedIn(): boolean {
        return this._session.isUserLoggedIn;
    }

    /**
     * Returns all the session details including information about the user, token expiration, etc.
     */
    get sessionData(): SecurityToken {
        return this._session.sessionData;
    }

    /**
     * Returns the refresh token for the user session.
     */
    get refreshToken(): string {
        return this._session.refreshToken;
    }

    /**
     * User that starts the propel app. (Only when running from Electron).
     */
    get runtimeInfo(): RuntimeInfo {
        return this._session.runtimeInfo;
    }

    /**
     * Allows to subscribe to security events.
     * @returns Security event subject.
     */
    getSecurityEventSubscription(): EventEmitter<SecurityEvent> {
        return this._securityEvent$;
    }

    /**
     * Gets the security API configuration.
     * @returns The security api configuration.
     */
    async getConfig(): Promise<SecuritySharedConfiguration> {
        let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL, SecurityEndpoint);

        return this.http.get<SecuritySharedConfiguration>(url, {
            headers: HttpHelper.buildHeaders(Headers.ContentTypeJson, Headers.XPropelNoAuth)
        })
            .toPromise();
    }

    /**
     * Indicates if the current user has access to the specified page.
     * @param page Page
     * @returns A boolean value indicating if the current user has access.
     */
    isAccessGranted(page: PageMetadata): boolean {
        let ret: boolean = false;

        if (!page) return false; //No page provided, no access can be granted.        
        if (!page.security.restricted) return true; //Page has no restrictions to access.

        //If authentication is required:
        if (page.security.restricted && !this._session.isUserLoggedIn) {
            ret = false;
        }

        if (page.security.restricted && this._session.isUserLoggedIn) {
            if (page.security.adminOnly && !this._session.sessionData.roleIsAdmin) {
                ret = false;
            }
            else {
                ret = true;
            }
        }

        return ret;
    }

    /**
     * Lock the user in order to prevent his next login attempt.
     * 
     * @param userId Identifier of the user to lock
     * @returns The user ID if the locking was successful
     */
    async lockUser(userId: string): Promise<void> {
        let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL,
            [SecurityEndpoint, SecurityEndpointActions.LockUser, userId]);

        return this.http.post<void>(url, null, {
            headers: HttpHelper.buildHeaders(Headers.ContentTypeJson)
        })
            .toPromise();
    }

    /**
     * Unlock the user specified in order to allow him to login.
     * 
     * @param userId Identifier of the user to lock
     * @returns The user ID if the locking was successful
     */
    async unlockUser(userId: string): Promise<void> {
        let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL,
            [SecurityEndpoint, SecurityEndpointActions.UnlockUser, userId]);

        return this.http.post<void>(url, null, {
            headers: HttpHelper.buildHeaders(Headers.ContentTypeJson)
        })
            .toPromise();
    }

    /**
     * Reset the user password so a new one will be requested during the next login.
     * @param userId User identifier
     * @returns The same user ID if the reset was successful.
     */
    async resetPassword(userId: string): Promise<UserRegistrationResponse> {
        let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL,
            [SecurityEndpoint, SecurityEndpointActions.ResetUserPassword, userId]);

        return this.http.post<UserRegistrationResponse>(url, null, {
            headers: HttpHelper.buildHeaders(Headers.ContentTypeJson)
        })
            .toPromise();
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
    getUser(userIdOrName: string): Promise<UserAccount> {
        let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL,
            [SecurityEndpoint, SecurityEndpointActions.GetUser, userIdOrName]);

        return this.http.get<UserAccount>(url, {
            headers: HttpHelper.buildHeaders(Headers.ContentTypeJson, Headers.XPropelNoAuth)
        })
            .toPromise();
    }

    /**
     * Persist, (create or update) the specified user account.
     * @param user User acount with the updates.
     * @returns The useraccount id if no error.
     */
    saveUser(user: UserAccount): Promise<UserRegistrationResponse> {
        let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL,
            [SecurityEndpoint, SecurityEndpointActions.SaveUser]);

        return this.http.post<UserRegistrationResponse>(url, user, {
            headers: HttpHelper.buildHeaders(Headers.ContentTypeJson)
        })
            .toPromise();
    }

    /**
     * Tries to reconnect the user sessions. This usually involves the following:
     * 
     *  -**If there is a refresh token**: It will try to refresh the session by returning a new 
     * access token for the user.
     * 
     *  -**If we are in Legacy security mode**: It will create a new access token for the "unknown" user.
     * @returns A message indicating the status of the operation.
     */
    async tryReconnectSession(): Promise<string> {
        let config = await this.getConfig()

        if (this._session.refreshToken) {
            try {
                await this.refreshAccessToken(new TokenRefreshRequest(this._session.refreshToken))
                return Promise.resolve(`User session reconnected.`);
            } catch (error) {
                await this.logOff()
                return Promise.reject(error)
            }
        }
        else if (config.legacySecurity)
            try {
                await this.login(new SecurityRequest());
                return Promise.resolve("Legacy security is on. Login was successful.");
            } catch (error) {
                return Promise.reject(`There was an error trying to login with Legacy security: "${error.message}"`)
            }
        else {
            return Promise.resolve("Legacy security is disabled and no refresh token was found. Session reconnection is not possible.");
        }
    }

    /**
     * User login process.
     * @param request SecurityRequest including all the infoneded for the user login process.
     * @returns A JWT token.
     */
    async login(request: SecurityRequest): Promise<UserLoginResponse> {
        let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL,
            [SecurityEndpoint, SecurityEndpointActions.Login]);
        let ri: RuntimeInfo = this._session.runtimeInfo;

        let config = await this.getConfig()

        if (!config.legacySecurity) {
            if (ri && ri.userName && ri.RDPUsers.length !== 0) {
                let user = ri.RDPUsers.find((u: RDPUser) => {
                    if (u.userName == request.userName) {
                        return u;
                    }
                })

                //If the login user is not one in the list of the connected RDP users:
                if (!user) {
                    //More details in the console:
                    logger.logError(`${ErrorCodes.UserImpersonation.key} error was raised. Details are:
Propel is running with the user "${request.userName}" credentials.
List of connected users in this machine are: ${ri.RDPUsers.map((u: RDPUser) => u.userName).join(", ")}`)

                    return Promise.reject(new PropelError("Impersonation is not allowed in Propel",
                        ErrorCodes.UserImpersonation));
                }
            }
        }

        return this.http.post<UserLoginResponse>(url, request,
            {
                headers: HttpHelper.buildHeaders(Headers.ContentTypeJson, Headers.XPropelNoAuth)
            })
            .pipe(
                map((results: UserLoginResponse) => {
                    this._session.setSessionData(results);
                    this._securityEvent$.emit(SecurityEvent.Login);
                    return results;
                }),
                tap(_ => {
                    logger.logInfo(`User ${this._session.sessionData.userFullName} (${this._session.sessionData.userName}) just login. Access expiring by "${(this.sessionData.expiresAt ? this.sessionData.expiresAt.toLocaleString() : "not defined")}".`)
                })
            )
            .toPromise();
    }

    /**
     * Refresh token. By this process we can supply a refresh token to the API and get a fresh new
     * access token.
     * @param request TokenRefreshRequest including the refresh token.
     * @returns A JWT token.
     */
    async refreshAccessToken(request: TokenRefreshRequest): Promise<UserLoginResponse> {
        let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL,
            [SecurityEndpoint, SecurityEndpointActions.Refresh]);

        return this.http.post<UserLoginResponse>(url, request,
            {
                headers: HttpHelper.buildHeaders(Headers.ContentTypeJson, Headers.XPropelNoAuth)
            })
            .pipe(
                catchError((err) => {
                    logger.logError(`Access token refresh finished with the following error: ${err.message}.`)
                    this.logOff()
                        .catch(_ => { })
                    return throwError(err)
                }),
                map((results: UserLoginResponse) => {
                    this._session.setSessionData(results);
                    this._securityEvent$.emit(SecurityEvent.Login);
                    return results;
                }),
                tap(_ => {
                    logger.logInfo(`Access token refreshed successfully, expiring on "${(this.sessionData.expiresAt ? this.sessionData.expiresAt.toLocaleString() : "not defined")}".`)
                })
            )
            .toPromise();
    }

    /**
     * User Sign out
     */
    logOff(): Promise<void> {
        let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL,
            [SecurityEndpoint, SecurityEndpointActions.Logoff]);

        return this.http.post<void>(url, new TokenRefreshRequest(this.refreshToken),
            {
                //No Auth headers in this call because this method will be automatically called if 
                //the access token refresh process failed. So we need to ensure the log off will be 
                //possible under that condition:
                headers: HttpHelper.buildHeaders(Headers.ContentTypeJson, Headers.XPropelNoAuth)
            })
            .pipe(
                catchError((error) => {
                    let e = new PropelError(error);
                    logger.logWarn(`User log off completed with errors. Following details: "${e.message}"`)
                    this._session.removeSessionData();
                    this._securityEvent$.emit(SecurityEvent.Logoff);
                    return of()
                }),
                tap(_ => {
                    logger.logInfo(`User log off completed.`)
                }),
                map(_ => {
                    this._session.removeSessionData();
                    this._securityEvent$.emit(SecurityEvent.Logoff);
                })
            )
            .toPromise();
    }
}