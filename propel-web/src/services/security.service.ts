import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { catchError, map, tap } from 'rxjs/operators';
import { RuntimeInfo } from '../../../propel-shared/core/runtime-info';
import { UserLoginResponse } from '../../../propel-shared/core/user-login-response';
import { UserAccount } from '../../../propel-shared/models/user-account';
import { UserAccountRolesUtil } from '../../../propel-shared/models/user-account-roles';
import { UserRegistrationResponse } from '../../../propel-shared/core/user-registration-response';
import { UserLoginRequest } from '../../../propel-shared/core/user-login-request';
import { TokenRefreshRequest } from '../../../propel-shared/core/token-refresh-request';
import { SecurityToken } from '../../../propel-shared/core/security-token';
import { SecuritySharedConfiguration } from '../../../propel-shared/core/security-shared-config';
import { lastValueFrom, of, throwError, fromEvent } from 'rxjs';
import { logger } from '../../../propel-shared/services/logger-service';
import { environment as env, environment } from 'src/environments/environment';
import { PageMetadata } from './app-pages.service';
import { PropelError } from '../../../propel-shared/core/propel-error';
import { Headers, HttpHelper } from 'src/util/http-helper';
import { SharedSystemHelper } from '../../../propel-shared/utils/shared-system-helper';
import { Utils } from '../../../propel-shared/utils/utils';

/**
 * This header indicates that no Authorization data is needed to be sent for the request.
 */
export const X_HEADER_NOAUTH = "x-propel-noauth"
export const SecurityEndpoint: string = "security";
export const RUNTIME_INFO_KEY: string = "PropelRuntimeInfo"
export const REFRESH_TOKEN_KEY: string = "PropelRefreshToken"

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

    private _securityEvent$: EventEmitter<SecurityEvent> = new EventEmitter<SecurityEvent>();
    private _securityToken?: SecurityToken;
    private _refreshToken: string = "";
    private _runtimeInfo!: RuntimeInfo;

    constructor(private http: HttpClient) {
        logger.logInfo("SecurityService instance created");
        this._initialize();
    }

    /**
     * Returns a boolean value indicating if there is a user already sign in.
     */
    get isUserLoggedIn(): boolean {
        return Boolean(this._securityToken);
    }

    /**
     * Returns all the session details including information about the user, token expiration, etc.
     */
    get sessionData(): SecurityToken {
        return this._securityToken!; //TODO: Need to fix in the future, this can actually be undefined.
    }

    /**
     * Returns the refresh token for the user session.
     */
    get refreshToken(): string {
        if (!this._refreshToken) {
            this.fetchRefreshToken();
        }

        return this._refreshToken;
    }

    /**
     * If the user already start session in this device, we are trying here to grab 
     * the refresh token from the local storage.
     */
    private fetchRefreshToken(): void {
        let refreshToken: string = localStorage.getItem(REFRESH_TOKEN_KEY) ?? "";

        if (refreshToken) {
            this._refreshToken = refreshToken;
        }
    }

    /**
     * User that starts the propel app. (Only when running from Electron).
     */
    get runtimeInfo(): RuntimeInfo {
        if (!this._runtimeInfo) {
            this.fetchRuntimeInfo();
        }

        return this._runtimeInfo;
    }

    /**
     * Caching the runtime info gathered by Electron when the app starts:
     */
    private fetchRuntimeInfo(): void {
        let runtimeInfo: string = sessionStorage.getItem(RUNTIME_INFO_KEY) ?? "";

        if (runtimeInfo) {
            try {
                this._runtimeInfo = JSON.parse(runtimeInfo);
            } catch (error) {
                logger.logError(`There was an error retrieving runtime info from session storage: "${String(error)}".`)
            }
            finally {
                sessionStorage.removeItem(RUNTIME_INFO_KEY);
            }
        }
        else {
            logger.logError(new PropelError(`${RUNTIME_INFO_KEY} is not present in session storage, is not possible to authenticate the user.`));
        }
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

        return lastValueFrom(this.http.get<SecuritySharedConfiguration>(url, {
            headers: HttpHelper.buildHeaders(Headers.ContentTypeJson, Headers.XPropelNoAuth)
        }));
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
        if (page.security.restricted && !this.isUserLoggedIn) {
            ret = false;
        }

        if (page.security.restricted && this.isUserLoggedIn) {
            if (page.security.adminOnly && !this.sessionData.roleIsAdmin) {
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

        return lastValueFrom(this.http.post<void>(url, null, {
            headers: HttpHelper.buildHeaders(Headers.ContentTypeJson)
        }));
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

        return lastValueFrom(this.http.get<UserAccount>(url, {
            headers: HttpHelper.buildHeaders(Headers.ContentTypeJson, Headers.XPropelNoAuth)
        }));
    }

    /**
     * Persist, (create or update) the specified user account.
     * @param user User acount with the updates.
     * @returns The useraccount id if no error.
     */
    saveUser(user: UserAccount): Promise<UserRegistrationResponse> {
        let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL,
            [SecurityEndpoint, SecurityEndpointActions.SaveUser]);

        return lastValueFrom(this.http.post<UserRegistrationResponse>(url, user, {
            headers: HttpHelper.buildHeaders(Headers.ContentTypeJson)
        }));
    }

    /**
     * Tries to reconnect the user sessions. This usually involves the following:
     * 
     *  -**If we are in Legacy security mode**: It will create a new access token for the "unknown" user.
     * 
     *  -**If there is a refresh token**: It will try to refresh the session by returning a new 
     * access token for the user.
     * 
     * @returns A message indicating the status of the operation.
     */
    async tryReconnectSession(): Promise<string> {
        if(this.isUserLoggedIn) return Promise.resolve("User session already established.");

        let config = await this.getConfig()

        if (config.legacySecurity) {
            try {
                await this.login(new UserLoginRequest());
                return Promise.resolve("Legacy security is on. Login was successful.");
            } catch (error: any) {
                return Promise.reject(`There was an error trying to login with Legacy security: "${(error.message) ? error.message : JSON.stringify(error)}"`)
            }
        }
        else if (this.refreshToken) {
            try {
                await this.refreshAccessToken(new TokenRefreshRequest(this.refreshToken))
                return Promise.resolve(`User session reconnected.`);
            } catch (error) {
                // try {
                //     await this.logOff()
                // } catch (e) {
                //     //We just did our best effort!
                // }
                //If the refresh token expired, we try now to start a new session using the Runtime info:
                try {
                    await this.login(new UserLoginRequest(this.runtimeInfo.runtimeToken))
                    return Promise.resolve(`Refresh token expired. A new user session was created using runtime info.`);
                } catch (error) {
                    return Promise.reject(error)
                }
            }
        }
        else if (this.runtimeInfo) {
            try {
                await this.login(new UserLoginRequest(this.runtimeInfo.runtimeToken))
                return Promise.resolve(`User "${this.runtimeInfo.userName} just logged in.`);
            } catch (error) {
                return Promise.reject(error)
            }
        }
        else {
            return Promise.resolve("Legacy security is disabled and no refresh or runtime token was found. Session reconnection/initiation is not possible.");
        }
    }

    /**
     * User login process.
     * @param request SecurityRequest including all the infoneded for the user login process.
     * @returns A JWT token.
     */
    async login(request: UserLoginRequest): Promise<UserLoginResponse> {
        let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL,
            [SecurityEndpoint, SecurityEndpointActions.Login]);
            
            
        return lastValueFrom(this.http.post<UserLoginResponse>(url, request,
            {
                headers: HttpHelper.buildHeaders(Headers.ContentTypeJson, Headers.XPropelNoAuth)
            })
            .pipe(
                map((results: UserLoginResponse) => {
                    this.setSessionData(results);
                    this._securityEvent$.emit(SecurityEvent.Login);
                    return results;
                }),
                tap(_ => {
                    logger.logInfo(`User ${this.sessionData.userFullName} (${this.sessionData.userName}) just login. Access expiring by "${(this.sessionData.expiresAt ? this.sessionData.expiresAt.toLocaleString() : "not defined")}".`)
                })
            ));
    }

    setSessionData(loginResponse: UserLoginResponse): void {
        let accessTokenSections: string[] = loginResponse.accessToken.split(".")
        let accessTokenPayload: any;

        if (accessTokenSections.length !== 3) throw new PropelError(`Invalid token. 
The provided JWT token is not properly formatted. We expect Header, Payload and Signature sections and we get ${accessTokenSections.length} sections.`);

        accessTokenPayload = SharedSystemHelper.decodeBase64(accessTokenSections[1]);

        if (!Utils.isValidJSON(accessTokenPayload)) {
            throw new PropelError(`Invalid token payload. 
The payload in the provided JWT token can't be parsed as JSON. Payload content is: ${accessTokenPayload} sections.`);
        }
        
        this._securityToken = new SecurityToken();
        this._securityToken.hydrateFromTokenPayload(JSON.parse(accessTokenPayload));
        this._securityToken.accessToken = loginResponse.accessToken;  
        
        this.saveRefreshToken(loginResponse.refreshToken);
    }
    
    /**
     * Remove any active session data.
     */
    removeSessionData() {
        this._securityToken = undefined;
        this.removeRefreshToken();   
    }

    private saveRefreshToken(refreshToken: string): void {
        if(!refreshToken){
            this.removeRefreshToken()
        }
        else {
            this._refreshToken = refreshToken;
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
        }
    }

    private removeRefreshToken(): void {
        this._refreshToken = ""
        localStorage.removeItem(REFRESH_TOKEN_KEY)
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

        return lastValueFrom(this.http.post<UserLoginResponse>(url, request,
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
                    this.setSessionData(results);
                    this._securityEvent$.emit(SecurityEvent.Login);
                    return results;
                }),
                tap(_ => {
                    logger.logInfo(`Access token refreshed successfully, expiring on "${(this.sessionData.expiresAt ? this.sessionData.expiresAt.toLocaleString() : "not defined")}".`)
                })
            ));
    }

    /**
     * User Sign out
     */
    logOff(): Promise<void> {
        let url: string = HttpHelper.buildURL(env.api.protocol, env.api.baseURL,
            [SecurityEndpoint, SecurityEndpointActions.Logoff]);

        return lastValueFrom(this.http.post<void>(url, new TokenRefreshRequest(this.refreshToken),
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
                    this.removeSessionData();
                    this._securityEvent$.emit(SecurityEvent.Logoff);
                    return of()
                }),
                tap(_ => {
                    logger.logInfo(`User log off completed.`)
                }),
                map(_ => {
                    this.removeSessionData();
                    this._securityEvent$.emit(SecurityEvent.Logoff);
                })
            ));
    }

    private _initialize() {
        fromEvent(window, "session-storage-changed")
            .subscribe({
                next: () => {
                    logger.logInfo("session-storage-changed event has been fired.");
                    this.fetchRuntimeInfo();
                    this.tryReconnectSession();
                }
            });

        //This applies ONLY to DEV ENVIRONMENT:
        fromEvent(window, "load")
            .subscribe({
                next: () => {

                    if (environment.production == false && environment.mocks) {
                        logger.logInfo(`load event has been fired. Loading RuntimeInfo mock "${environment.mocks.activeMocks.runtimeInfo}".`);
                        //@ts-ignore
                        this._runtimeInfo = environment.mocks.runtimeInfo![environment.mocks.activeMocks.runtimeInfo];
                    }

                    this.tryReconnectSession();
                }
            });        
    }
}