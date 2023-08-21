import { RuntimeInfo } from '../../../propel-shared/core/runtime-info';
import { SecurityToken } from '../../../propel-shared/core/security-token';
import { logger } from '../../../propel-shared/services/logger-service';
import { environment } from 'src/environments/environment';
import { SharedSystemHelper } from '../../../propel-shared/utils/shared-system-helper';
import { Utils } from '../../../propel-shared/utils/utils';
import { PropelError } from '../../../propel-shared/core/propel-error';
import { RDPUser } from '../../../propel-shared/core/rdp-user';
import { UserLoginResponse } from '../../../propel-shared/core/user-login-response';

const RUNTIME_INFO_KEY: string = "PropelRuntimeInfo"
const REFRESH_TOKEN_KEY: string = "PropelRefreshToken"

/**
 * This class help manage every aspect of user security, user authentication and authorization.
 */
export class SessionService {
    
    private _securityToken?: SecurityToken;
    private _refreshToken: string = "";
    private _runtimeInfo!: RuntimeInfo;

    constructor() {
        logger.logInfo("SessionService instance created");
        
        this.fetchRuntimeInfo();
        this.fetchRefreshToken();

        if (this.runtimeInfo) {
            logger.logInfo(`Connected as "${this._runtimeInfo.userName}".`);
        }
        else {
            logger.logInfo("Runtime user info not found.");
        }
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
     * Returns the refresh token.
     */
    get refreshToken(): string {
        return this._refreshToken;
    }

    /**
     * User that starts the propel app. (Only when running from Electron).
     */
    get runtimeInfo(): RuntimeInfo {
        return this._runtimeInfo;
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
        //@ts-ignore
        else if (environment.production == false && environment.mocks) {
            //@ts-ignore
            this._runtimeInfo = environment.mocks.runtimeInfo[environment.mocks.activeMocks.runtimeInfo];
        }
        else {
            logger.logError(new PropelError(`${RUNTIME_INFO_KEY} is not present in session storage, is not possible to authenticate the user.`));
        }
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
}