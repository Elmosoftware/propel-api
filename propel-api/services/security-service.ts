import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED, FORBIDDEN } from "http-status-codes";

import { cfg } from "../core/config";
import { PropelError } from "../../propel-shared/core/propel-error";
import { UserLoginRequest } from "../../propel-shared/core/user-login-request";
import { TokenRefreshRequest } from "../../propel-shared/core/token-refresh-request";
import { SecuritySharedConfiguration } from "../../propel-shared/core/security-shared-config";
import { SecurityToken, TokenPayload } from "../../propel-shared/core/security-token";
import { UserRegistrationResponse } from "../../propel-shared/core/user-registration-response";
import { DataService } from "../services/data-service";
import { UserAccount } from "../../propel-shared/models/user-account";
import { UserAccountSecret } from "../../propel-shared/models/user-account-secret";
import { db } from "../core/database";
import { Secret } from "../../propel-shared/models/secret";
import { QueryModifier } from "../../propel-shared/core/query-modifier";
import { Utils } from '../../propel-shared/utils/utils';
import { ErrorCodes } from '../../propel-shared/core/error-codes';
import { SecurityRuleSelector } from '../core/security-rule-selector';
import { UserLoginResponse } from '../../propel-shared/core/user-login-response';
import { RuntimeInfo } from '../../propel-shared/core/runtime-info';
import { allRoutes } from '../routes/all-routes';
import { UserAccountRoles } from '../../propel-shared/models/user-account-roles';
import { UserSession } from '../../propel-shared/models/user-session';
import { PagedResponse } from '../../propel-shared/core/paged-response';
import { SharedSystemHelper } from '../../propel-shared/utils/shared-system-helper';
import { SystemHelper } from '../util/system-helper';
import { RDPUser } from '../../propel-shared/core/rdp-user';

export const LEGACY_USER_ID: string = "000000010000000000100001"
export const LEGACY_USER_NAME: string = "Unknown user"

export class SecurityService {

    /**
     * Holds all the data related to a login process.
     */
    loginData!: LoginData<any>;

    ruler: SecurityRuleSelector;

    private _token?: SecurityToken;

    constructor(token?: SecurityToken) {
        this.ruler = new SecurityRuleSelector(allRoutes);
        this._token = token
    }

    /**
     * Returns the shared security configuration.
     * @returns The shared configuration of the Security API.
     */
    getSharedConfig(): SecuritySharedConfiguration {
        let ret: SecuritySharedConfiguration = new SecuritySharedConfiguration();

        ret.legacySecurity = cfg.isLegacySecurityEnabled;
        ret.authCodeLength = cfg.authorizationCodeLength;
        ret.passwordMinLength = cfg.passwordMinLength;
        ret.passwordMaxLength = cfg.passwordMaxLength;

        return ret;
    }

    /**
     * Register a new Propel User Account or update an existing one.
     * @param user User to register or update.
     * @returns A String containing the user ID if the operation was succesful.
     */
    async registerOrUpdateUser(user: UserAccount): Promise<UserRegistrationResponse> {

        let authCode: string = "";

        //If is a new user:
        if (!user._id) {
            //Enforcing the setup of some initial values for every new user:
            user.lastLogin = null;
            user.lastPasswordChange = null;
            user.lockedSince = null;
            user.mustReset = false;

            //If is a new user we need to generate a secret with an authentication code:
            authCode = this.createAuthCode();
            user.secretId = await this.createNewSecret(authCode);
        }

        let ret: UserRegistrationResponse = new UserRegistrationResponse();
        ret.userId = await this.saveUser(user);
        ret.secretId = user.secretId;
        ret.authCode = authCode;

        return ret;
    }

    /**
     * Allows to obtain one particular user account by specifying the user name.
     * @param nameOrID User Name.
     * @returns The requested user or "undefined" if the user doesn't exists.
     */
    async getUserByNameOrID(nameOrID: string): Promise<UserAccount | undefined> {
        let svc: DataService = db.getService("useraccount", this._token);
        let result: PagedResponse<UserAccount>;
        let qm = new QueryModifier();

        if (DataService.isValidObjectId(nameOrID)) {
            qm.filterBy = { _id: nameOrID }
        }
        else {
            qm.filterBy = { name: { $eq: nameOrID } };
        }

        result = await svc.find(qm) as PagedResponse<UserAccount>;
        return Promise.resolve(result.data[0])
    }

    async getUserSession(refreshToken: string): Promise<UserSession | undefined> {
        let svc: DataService = db.getService("usersession", this._token);
        let result: PagedResponse<UserSession>;
        let qm = new QueryModifier();

        qm.filterBy = { _id: refreshToken }

        try {
            result = await svc.find(qm) as PagedResponse<UserSession>;
        } catch (error) {
            return Promise.reject(error)
        }

        return Promise.resolve(result.data[0]);
    }

    getLegacyUser(): UserAccount {
        let ret: UserAccount = new UserAccount();

        ret._id = LEGACY_USER_ID
        ret.name = LEGACY_USER_NAME
        ret.role = UserAccountRoles.Administrator

        return ret;
    }

    /**
     * Handle the user login for all the possible scenarios.
     * Scenarios at the moment handled by this method are:
     *  - First login: The user has been created but never login before. 
     *  - Regular login: The user already have a password set and it would like to login using it.
     *  - System password reset login: The password of the user was reseted by an administrator.
     * @param request Security request
     * @returns The security token if the user auth process finish successfully.
     * @throws This method is going to throw exceptions under the following conditions:
     *  - **Invalid or missing data** in the security request (**HTTP status 400** Bad request)
     *  - **User doesn't exist** (**HTTP status 401** Unauthorized)
     *  - **User is locked** (**HTTP status 403** Forbidden)
     *  - **User doesn't have a secret when is expected**, (unlikely to happen) (**HTTP Status 500** Internal server error).
     *  - **Wrong password** (**HTTP status 401** Unauthorized)
     */
    async handleUserLogin(request: UserLoginRequest): Promise<UserLoginResponse> {

        this.loginData = new LoginData(request);

        //The user login process is complex and made by different use cases. We manage to handle this 
        //with the below methods they are executin sequentially but in async way and they are filling the 
        // "loginData" until the point the authentication succeed or fail: 
        let toEval = [
            /**
             * Basic validation of the security request.
             */
            this.validateRequest,
            /**
             * Retrieves the user information and verify if the user exists, is not locked, etc.
             */
            this.getAndVerifyUser,
            /**
             * Handle the case of Propel Legacy security request.
             */
            this.handleLegacyLogin,
            /**
             * This is the most common scenario. he user already have a secret and wants to login.
             */
            this.handleLogin
        ]

        await Utils.asyncForEach(toEval, async (func: Function) => {
            await func(this);
        })

        let ret: UserLoginResponse = new UserLoginResponse();

        ret.accessToken = this.loginData.accessToken;
        ret.refreshToken = this.loginData.refreshToken;

        return Promise.resolve(ret);
    }

    async handleUserLogoff(request: TokenRefreshRequest): Promise<void> {
        let svc: DataService = db.getService("usersession", this._token);

        try {
            await svc.delete(request.refreshToken)
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error)
        }
    }

    async handleTokenRefresh(request: TokenRefreshRequest): Promise<UserLoginResponse> {

        this.loginData = new LoginData(request);

        let toEval = [
            /**
             * Basic validation of the refresh token request.
             */
            this.validateTokenRefreshRequestFormat,
            /**
             * Retrieves the user session and verify if the user is not locked.
             */
            this.getAndVerifyUserSession
        ]

        await Utils.asyncForEach(toEval, async (func: Function) => {
            await func(this);
        })

        let ret: UserLoginResponse = new UserLoginResponse();

        ret.accessToken = this.createToken(this.loginData.user!, false);
        ret.refreshToken = this.loginData.refreshToken;

        return Promise.resolve(ret);
    }

    /**
     * Reset a user account password. If the user password is already flagged 
     * for reset, there will be no action.
     * @param nameOrId Name or ID of the user whose password willbe reset.
     * @returns The user ID if the operation was successfully done. 
     * If the user password is already flagged for reset, there willbe no action.
     * @throws 
     *  - **User doesn't exist** (**HTTP status 500** Internal Server error).
     */
    async resetUserPassword(nameOrId: string): Promise<UserRegistrationResponse> {

        let user: UserAccount | undefined = await this.getUserByNameOrID(nameOrId);
        let ret: UserRegistrationResponse = new UserRegistrationResponse();

        this.throwIfNoUser(user, nameOrId, "The reset password process can't continue.");

        user!.mustReset = true; //Flag the user for reset on next login
        ret.authCode = this.createAuthCode(); //Getting an auth code, (the user must use on next login). 
        //Creating the secret and associating it to the user:
        user!.secretId = await this.createNewSecret(ret.authCode);
        ret.secretId = user!.secretId
        ret.userId = await this.saveUser(user!); //Saving the user.

        return ret;
    }

    async lockUser(nameOrId: string): Promise<void> {
        return this.internalLockOrUnlockUser(nameOrId, true)
    }

    async unlockUser(nameOrId: string): Promise<void> {
        return this.internalLockOrUnlockUser(nameOrId, false)
    }

    decryptRuntimeInfo(runtimeToken: string): RuntimeInfo {
        let jsonRI: string = SystemHelper.decrypt(runtimeToken, cfg.runtimeTokenKeys)
        return JSON.parse(jsonRI);
    }

    private async internalLockOrUnlockUser(nameOrId: string, mustLock: boolean): Promise<void> {

        try {
            let user: UserAccount | undefined = await this.getUserByNameOrID(nameOrId);
            this.throwIfNoUser(user, nameOrId, `The ${(mustLock) ? "lock" : "unlock"} user operation will be aborted.`)

            if (mustLock) {
                user!.lockedSince = new Date();
            }
            else {
                user!.lockedSince = null;
            }

            await this.saveUser(user!)

        } catch (error) {
            return Promise.reject(error)
        }

        return Promise.resolve();
    }

    private throwIfNoUser(user: UserAccount | undefined, nameOrId: string, additionalInfo: string = ""): void {
        if (!user) throw new PropelError(`No user with Name or ID "${nameOrId}" was found. ${additionalInfo}`,
            undefined, INTERNAL_SERVER_ERROR.toString()); {
        }
    }

    private async validateRequest(context: SecurityService): Promise<void> {

        let request: UserLoginRequest = context.loginData.request;
        let config: SecuritySharedConfiguration = context.getSharedConfig()

        context.loginData.legacySecurity = config.legacySecurity;

        if (context.loginData.legacySecurity && !request.runtimeToken) return Promise.resolve();

        if (!request?.runtimeToken) {
            throw new PropelError(`Bad format in the request body, we need a runtime token!`,
                undefined, BAD_REQUEST.toString());
        }

        try {
            context.loginData.runtimeInfo = context.decryptRuntimeInfo(request?.runtimeToken);
        } catch (error) {
            return Promise.reject(error)
        }

        return Promise.resolve();
    }

    private async validateTokenRefreshRequestFormat(context: SecurityService): Promise<void> {

        let request: TokenRefreshRequest = context.loginData.request;

        if (!request.refreshToken) {
            throw new PropelError(`Bad format in the request body, we expect the "refreshToken" property.`,
                undefined, BAD_REQUEST.toString());
        }
        else if (!DataService.isValidObjectId(request.refreshToken)) {
            throw new PropelError(`Bad format in the request body, the provided refresh token is invalid.`,
                undefined, BAD_REQUEST.toString());
        }

        return Promise.resolve();
    }

    private validatePassword(password: string): void {

        if (!password || password.length < cfg.passwordMinLength || password.length > cfg.passwordMaxLength) {
            throw new PropelError(`Password bad format. Allowed passwords must have at least ${cfg.passwordMinLength} characters and no more than ${cfg.passwordMaxLength}. The one provided have ${password.length}.`,
                ErrorCodes.PasswordBadFormat, BAD_REQUEST.toString());
        }
    }

    private async getAndVerifyUser(context: SecurityService): Promise<void> {

        let loginData = context.loginData;

        if (loginData.legacySecurity) {
            loginData.user = context.getLegacyUser();
        }
        else {
            loginData.user = await context.getUserByNameOrID(loginData.runtimeInfo!.userName!);
        }

        if (!loginData.user) 
            throw new PropelError(`No user with Name or ID "${loginData.runtimeInfo!.userName!}" was found.`,
            ErrorCodes.LoginWrongUser, FORBIDDEN.toString()); {
        }

        if (loginData.user?.lockedSince) {
            throw new PropelError(`The user "${loginData.runtimeInfo!.userName!}" is locked.`,
                ErrorCodes.LoginLockedUser, FORBIDDEN.toString());
        }

        if (!loginData.legacySecurity) {
            if (loginData.runtimeInfo!.RDPUsers.length !== 0) {
                let user = loginData.runtimeInfo!.RDPUsers.find((u: RDPUser) => {
                    if (u.userName == loginData.runtimeInfo!.userName) {
                        return u;
                    }
                })

                //If the login user is not one in the list of the connected RDP users:
                if (!user) {
                    throw new PropelError(`${ErrorCodes.UserImpersonation.key} error was raised. Details are:
Propel is running with the user "${loginData.runtimeInfo!.userName}" credentials.
List of connected users in this machine are: ${loginData.runtimeInfo!.RDPUsers.map((u: RDPUser) => u.userName).join(", ")}`,
                        ErrorCodes.UserImpersonation)
                }
            }
            //TODO: Do we need to raise an error if RDPUsers.length is 0???
        }

        return Promise.resolve();
    }

    private async getAndVerifyUserSession(context: SecurityService): Promise<void> {

        let request: TokenRefreshRequest = context.loginData.request;
        let session = await context.getUserSession(request.refreshToken)

        if (session) {
            context.loginData.userSession = session;
            context.loginData.user = session.user;
            context.loginData.refreshToken = request.refreshToken

            //If the user is locked, we must prevent the user to login.
            if (session.user.lockedSince) {
                throw new PropelError(`The user "${session.user.name}" is locked.`,
                    ErrorCodes.LoginLockedUser, FORBIDDEN.toString());
            }

            return Promise.resolve();
        }
        else {
            throw new PropelError(`Refreshtoken "${request.refreshToken} is missing or expired."`,
                ErrorCodes.RefreshTokenIsExpired, UNAUTHORIZED.toString());
        }
    }

    private async handleLegacyLogin(context: SecurityService): Promise<void> {

        let loginData = context.loginData;

        //If the token was already created, we have nothing else to do here:
        if (loginData.accessToken) return Promise.resolve();
        //If Legacy security is not enabled, we have nothing else to do here:
        if (!loginData.legacySecurity) return Promise.resolve();

        loginData.user!.lastLogin = new Date();
        loginData.accessToken = context.createToken(loginData.user!, loginData.legacySecurity)

        return Promise.resolve();
    }

    private async handleLogin(context: SecurityService): Promise<void> {

        let loginData = context.loginData;

        //If the token was already created, we have nothing else to do here:
        if (loginData.accessToken) return Promise.resolve();

        loginData.user!.lastLogin = new Date();
        await context.saveUser(loginData.user!);
        loginData.accessToken = context.createToken(loginData.user!, loginData.legacySecurity)
        loginData.refreshToken = await context.createRefreshToken(loginData)

        return Promise.resolve();
    }

    private async createHash(password: string): Promise<string> {
        const saltRounds = 10;
        let salt = await bcrypt.genSalt(saltRounds);
        return bcrypt.hash(password, salt);
    }

    private createToken(user: UserAccount, isLegacySecurity: boolean): string {
        let dataPayload: SecurityToken;
        let options: any = {};

        //When in Legacy security, there is no point to have a token with expiration: 
        if (isLegacySecurity) {
            dataPayload = new SecurityToken();
        }
        else {
            dataPayload = new SecurityToken(cfg.tokenExpirationMinutes)
            options.expiresIn = `${cfg.tokenExpirationMinutes}Min`;  //Token expiration in 
            //minutes in zeit/ms format. (More info: https://github.com/vercel/ms)
        }

        dataPayload.hydrateFromUser(user);
        dataPayload.legacySecurity = isLegacySecurity;

        return jwt.sign({
            data: dataPayload
        }, cfg.encryptionKey, options);
    }

    private async createRefreshToken(loginData: LoginData<UserLoginRequest>): Promise<string> {
        let svc: DataService;
        let session: UserSession;
        let sessionId: string;

        if (!loginData.user) return Promise.resolve("");

        svc = db.getService("usersession", this._token);
        session = new UserSession();
        session.startedAt = new Date();
        session.user = DataService.asObjectIdOf<UserAccount>(loginData.user._id);

        try {
            sessionId = await svc.add(session);
        } catch (error) {
            return Promise.reject(error);
        }

        return Promise.resolve(sessionId);
    }

    verifyToken(token: string): SecurityToken {
        let ret: SecurityToken = new SecurityToken();

        try {
            ret.hydrateFromTokenPayload((jwt.verify(token, cfg.encryptionKey) as TokenPayload));
        } catch (error) {

            //If the token has expired: https://github.com/auth0/node-jsonwebtoken/blob/master/README.md#tokenexpirederror
            if ((error as Error).name == "TokenExpiredError") {
                throw new PropelError((error as Error), ErrorCodes.TokenIsExpired, UNAUTHORIZED.toString());
            }

            throw new PropelError((error as Error), undefined, UNAUTHORIZED.toString());
        }

        return ret;
    }

    private async getUserSecret(secretId: string): Promise<Secret<UserAccountSecret> | undefined> {
        let svc: DataService = db.getService("secret", this._token);
        let result: PagedResponse<Secret<UserAccountSecret>>;
        let qm = new QueryModifier();

        qm.filterBy = { _id: secretId }

        try {
            result = await svc.find(qm) as PagedResponse<Secret<UserAccountSecret>>;
        } catch (error) {
            return Promise.reject(error);
        }

        return Promise.resolve(result.data[0]);
    }

    private async createNewSecret(passwordOrAuthCode: string): Promise<string> {

        let secret = new Secret<UserAccountSecret>(UserAccountSecret)
        secret.value.passwordHash = await this.createHash(passwordOrAuthCode);

        //Now we must persist the secret and return the secret id:
        return await this.saveUserSecret(secret);
    }

    private async saveUserSecret(secret: Secret<UserAccountSecret>): Promise<string> {
        let svc: DataService = db.getService("secret", this._token);
        let id: string;

        try {
            //If is a new secret:
            if (!secret._id) {
                id = await svc.add(secret);
            }
            else {
                id = await svc.update(secret);
            }
        } catch (error) {
            return Promise.reject(error);
        }

        return Promise.resolve(id);
    }

    private async saveUser(user: UserAccount): Promise<string> {
        let svc: DataService = db.getService("useraccount", this._token);
        let id: string;

        try {
            //If is a new user:
            if (!user._id) {
                id = await svc.add(user);
            }
            else {
                id = await svc.update(user);
            }
        } catch (error) {
            return Promise.reject(error)
        }

        return Promise.resolve(id);
    }

    private createAuthCode(): string {
        return SharedSystemHelper.getUniqueId(cfg.authorizationCodeLength);
    }
}

/**
 * Internal class used to hold all the data involved in the login process.
 */
class LoginData<T> {

    constructor(request: T) {
        this.request = request;
    }

    /**
     * Security request data with all the information for the login.
     */
    public request: T;

    /**
     * User that is requesting the login.
     */
    public user: UserAccount | undefined;

    /**
     * The user session.
     */
    public userSession: UserSession | undefined;

    /**
     * Access token generated after authentication.
     */
    public accessToken: string = ""

    /**
     * Refresh token tied to user session.
     */
    public refreshToken: string = ""

    /**
     * Runtime info of the user to simplify the login process.
     */
    public runtimeInfo: RuntimeInfo | undefined

    /**
     * Indicate if legacy security is enabled in Propel. This is for backward compatibility only.
     * User security will be automatically turned off as soon at least one user account 
     * with Administrator role is added and logged in successfully.
     */
    public legacySecurity: boolean = false
}