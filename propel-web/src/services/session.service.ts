import { RuntimeInfo } from '../../../propel-shared/core/runtime-info';
import { SecurityToken } from '../../../propel-shared/core/security-token';
import { logger } from '../../../propel-shared/services/logger-service';
import { environment } from 'src/environments/environment';
import { SystemHelper } from 'src/util/system-helper';
import { Utils } from '../../../propel-shared/utils/utils';
import { PropelError } from '../../../propel-shared/core/propel-error';
import { RDPUser } from '../../../propel-shared/core/rdp-user';

const RUNTIME_INFO_KEY: string = "PropelRuntimeInfo"

/**
 * This class help manage every aspect of user security, user authentication and authorization.
 */
export class SessionService {
    
    private _securityToken: SecurityToken;
    private _runtimeInfo: RuntimeInfo;

    constructor() {
        logger.logInfo("SessionService instance created");
        
        //Caching the runtime info gather by Electron when the app starts:
        if (sessionStorage.getItem(RUNTIME_INFO_KEY)) {
            logger.logInfo("Storing Runtime user info");
            this._runtimeInfo = JSON.parse(sessionStorage.getItem(RUNTIME_INFO_KEY));
            logger.logInfo(`Connected as "${this._runtimeInfo.userName}".`);
        }
        else {
            logger.logInfo("Runtime user info not found.");
        }

        // //////////////////////////////////////////////////////////////////////////
        // if (environment.production == false) {
        //     //DEBUG ONLY:
        //     //  For debugging purposes only and to emulate a defined user in a dev env:
        //     //  Comment below lines if you would like to login specifying a runtime info like the 
        //     //  one created by Electron start scripts when the app starts in prod:

        //     let x = new RuntimeInfo();
        //     //If you want to login as an Administrator, comment out below lines:
        //     //----------------------------------------------------------------------
        //     x.userName = "test.admin.1";
        //     //To auto login keep the below line commented out, (ensure the password is right).
        //     // (x as any).password = "testadminone" 
            
        //     //If you would like to login as a regular user, comment out below lines:
        //     //----------------------------------------------------------------------
        //     // x.userName = "test.regular.1";
        //     // //To auto login keep the below line commented out, (ensure the password is right).
        //     // (x as any).password = "testregularone" 
            
        //     //If you would like to test the "User impersonation forbiddeb error, comment below line:
        //     x.RDPUsers.push(new RDPUser(x.userName, "Active")) 

        //     x.RDPUsers.push(new RDPUser("user.1", "Active"))
        //     x.RDPUsers.push(new RDPUser("user.2", "Disconected"))
        //     this._runtimeInfo = x;
        //     logger.logInfo(`DEBUG - Connected as "${this._runtimeInfo.userName}"${((x as any).password) ? " with AUTO-LOGIN" : ""}.`);
        // }   
        // //////////////////////////////////////////////////////////////////////////

        this._securityToken = null;
   }

    /**
     * Returns a boolean value indicating if there is a user already sign in.
     */
    get isUserLoggedIn(): boolean {
        return Boolean(this._securityToken);
    }

    /**
     * Returns a boolean value that indicates if Legacy security, (Propel 2.0 and before),is on.
     */
    get isLegacy(): boolean {
        return (this._securityToken && this._securityToken.legacySecurity);
    }

    /**
     * Returns all the session details including information about the user, token expiration, etc.
     */
    get sessionData(): SecurityToken {
        if (!this._securityToken) return null;
        return Object.assign({}, this._securityToken);
    }

    /**
     * User that starts the propel app. (Only when running from Electron).
     */
    get runtimeInfo(): RuntimeInfo {
        if (!this._runtimeInfo) return null;
        return Object.assign({}, this._runtimeInfo);
    }

    setSessionData(token: string): void {
        let tokenSections: string[] = token.split(".")
        let tokenPayload: any;

        if (tokenSections.length !== 3) throw new PropelError(`Invalid token. 
The provided JWT token is not properly formatted. We expect Header, Payload and Signature sections and we get ${tokenSections.length} sections.`);

        tokenPayload = SystemHelper.decodeBase64(tokenSections[1]);

        if (!Utils.isValidJSON(tokenPayload)) {
            throw new PropelError(`Invalid token payload. 
The payload in the provided JWT token can't be parsed as JSON. Payload content is: ${tokenPayload} sections.`);
        }
        
        this._securityToken = new SecurityToken();
        this._securityToken.hydrateFromTokenPayload(JSON.parse(tokenPayload));
        this._securityToken.accessToken = token;        
    }
    
    /**
     * Remove any active session data.
     */
    removeSessionData() {
        this._securityToken = null;       
    }
}