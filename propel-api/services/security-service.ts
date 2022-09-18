import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED, FORBIDDEN } from "http-status-codes";
import { nanoid } from 'nanoid'

import { cfg } from "../core/config";
import { PropelError } from "../../propel-shared/core/propel-error";
import { SecurityRequest } from "../../propel-shared/core/security-request";
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
import { allRoutes } from '../routes/all-routes';
import { UserAccountRoles } from '../../propel-shared/models/user-account-roles';
import { UserSession } from '../../propel-shared/models/user-session';
import { PagedResponse } from '../../propel-shared/core/paged-response';

export const LEGACY_USER_ID:string = "000000010000000000100001"
export const LEGACY_USER_NAME:string = "Unknown user"

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
    async getSharedConfig(): Promise<SecuritySharedConfiguration> {
        let svc: DataService = db.getService("useraccount", this._token);
        let qm = new QueryModifier();
        let result: PagedResponse<UserAccount>;
        let ret: SecuritySharedConfiguration = new SecuritySharedConfiguration();

        qm.top = 1
        qm.filterBy = {
            $and:[
                {
                    role: UserAccountRoles.Administrator
                }, 
                {
                    lastLogin: {
                        $ne: null
                    }
                }
            ]
        }

        try {
            result = await svc.find(qm) as PagedResponse<UserAccount>
            ret.legacySecurity = result.count == 0
            ret.authCodeLength = cfg.authorizationCodeLength;
            ret.passwordMinLength = cfg.passwordMinLength;
            ret.passwordMaxLength = cfg.passwordMaxLength;

            // //////////////////////////////////////////////////
            // //DEBUG ONLY:
            // if (!cfg.isProduction) {
            //     //Force legacy security for testing purposes:
            //     ret.legacySecurity = true;
            // }
            // //////////////////////////////////////////////////
        } catch (error) {
            return Promise.reject(error);
        }

        return Promise.resolve(ret);
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
    async handleUserLogin(request: SecurityRequest): Promise<UserLoginResponse> {

        this.loginData = new LoginData(request);

        //The user login process is complex and made by different use cases. We manage to handle this 
        //with the below methods they are executin sequentially but in async way and they are filling the 
        // "loginData" until the point the authentication succeed or fail: 
        let toEval = [
            /**
             * Basic validation of the security request.
             */
            this.validateSecurityRequestFormat,
            /**
             * Retrieves the user information and verify if the user is not locked.
             */
            this.getAndVerifyUser,
            /**
             * Retrieve the user secret,(if any is already set).
             */
            this.getAndVerifyUserSecret,
            /**
             * Handle the case of Propel Legacy security request.
             */
             this.handleLegacySecurityRequest,
            /**
             * Handle the special case of a first login, where the user has no secret yet and he/she never 
             * login the app yet.
             */
            this.handleFirstLogin,
            /**
             * This is the most common scenario. he user already have a secret and wants to login.
             */
            this.handleRegularLogin,
            /**
             * The user was flagged for password reset on his next login, this method handle those cases.
             */
            this.handlePasswordResetLogin
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

    private async validateSecurityRequestFormat(context: SecurityService): Promise<void> {

        let request: SecurityRequest = context.loginData.request;
        let config: SecuritySharedConfiguration = await context.getSharedConfig()

        context.loginData.legacySecurity = config.legacySecurity;

        if (context.loginData.legacySecurity) return Promise.resolve();

        if (!request?.userName || !request?.password) {
            throw new PropelError(`Bad format in the request body, we expect the user name and the user password. 
            Property "userName": ${(request?.userName) ? "is present" : "Is missing"}, Property "password": ${(request?.password) ? "is present" : "Is missing"}.`,
                undefined, BAD_REQUEST.toString());
        }

        return Promise.resolve();
    }

    private async validateTokenRefreshRequestFormat(context: SecurityService): Promise<void> {

        let request: TokenRefreshRequest = context.loginData.request;

        if (!request.refreshToken) {
            throw new PropelError(`Bad format in the request body, we expect the "refreshToken" property.`,
                undefined, BAD_REQUEST.toString());
        }
        else if(!DataService.isValidObjectId(request.refreshToken)) {
            throw new PropelError(`Bad format in the request body, the provided refresh token is invalid.`,
                undefined, BAD_REQUEST.toString());
        }

        return Promise.resolve();
    }

    private validateAuthenticationCode(authCode: string): void {

        if (!authCode || authCode.length !== cfg.authorizationCodeLength) {
            throw new PropelError(`Authorization code bad format. Authorization code must have exactly ${cfg.authorizationCodeLength} characters. 
The one provided is ${(authCode) ? authCode.length.toString() + " char(s) long." : "\"" + String(authCode) + "\""}.`,
                ErrorCodes.AuthCodeBadFormat, BAD_REQUEST.toString());
        }
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
            loginData.user = await context.getUserByNameOrID(loginData.request.userName);
        }

        context.throwIfNoUser(loginData.user, loginData.request.userName);

        //If the user is locked, we must prevent the user to login.
        if (loginData.user?.lockedSince) {
            throw new PropelError(`The user "${loginData.request.userName}" is locked.`,
                ErrorCodes.LoginLockedUser, FORBIDDEN.toString());
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

    private async getAndVerifyUserSecret(context: SecurityService): Promise<void> {

        let loginData = context.loginData;

        if (loginData.legacySecurity) return Promise.resolve();

        //Corrupted data:
        if (!loginData.user?.secretId) {
            throw new PropelError(`No secretId found for user with Name or ID "${loginData.request.userName}". 
                Will require a System admin to reset the password.`, undefined, INTERNAL_SERVER_ERROR.toString());
        }

        loginData.secret = await context.getUserSecret(loginData.user.secretId);

        /*
            Note: This is a very unlikely case, but we need to check anyway because 
            the login can't complete if we don't have the current user secret!.
            If the secret is gone for some reason, the only option is that one administrator
            reset his password or even to null the "lastLogin" date so the user can do 
            a first login again. 
        */
        if (!loginData.secret) {
            throw new PropelError(`No secret was found for user with Name or ID "${loginData.request?.userName}". 
                The specified User secret with id:"${loginData.user?.secretId}" doesn't exists. Property "mustReset" is "${String(loginData.user?.mustReset)}".
                Will require a System admin to reset user password.`,
                undefined, INTERNAL_SERVER_ERROR.toString());
        }

        return Promise.resolve();
    }

    private async handleLegacySecurityRequest(context: SecurityService): Promise<void> {

        let loginData = context.loginData;

        //If the token was already created, we have nothing else to do here:
        if (loginData.accessToken) return Promise.resolve();
        //If Legacy security is not enabled, we have nothing else to do here:
        if (!loginData.legacySecurity) return Promise.resolve();

        loginData.user!.lastLogin = new Date();
        loginData.accessToken = context.createToken(loginData.user!, loginData.legacySecurity)

        return Promise.resolve();
    }

    private async handleRegularLogin(context: SecurityService): Promise<void> {

        let loginData = context.loginData;

        //If the token was already created, we have nothing else to do here:
        if (loginData.accessToken) return Promise.resolve();

        //Regular login: The user already login at least once, and his password wasn't flag for reset:
        if (loginData.user?.lastLogin && !loginData.user?.mustReset) {

            context.validatePassword(loginData.request.password)

            //If the password is ok, we must return the token and update the user last login:
            if (await context.verifyHash(loginData.request.password, loginData.secret!.value.passwordHash!)) {

                loginData.user!.lastLogin = new Date();
                await context.saveUser(loginData.user!);
                loginData.accessToken = context.createToken(loginData.user, loginData.legacySecurity)
                loginData.refreshToken = await context.createRefreshToken(loginData)
            }
            else {
                throw new PropelError(`Wrong password supplied by ${loginData.user?.fullName} (${loginData.user?.name}), Login is denied.`,
                    ErrorCodes.LoginWrongPassword, UNAUTHORIZED.toString());
            }
        }

        return Promise.resolve();
    }

    private async handleFirstLogin(context: SecurityService): Promise<void> {

        let loginData = context.loginData;

        //If the token was already created, we have nothing else to do here:
        if (loginData.accessToken) return Promise.resolve();

        //First login ever:
        if (!loginData.user?.lastLogin) {

            context.validateAuthenticationCode(loginData.request.password) //For a first login, 
            //the "password" field in the request is the auth code.
            context.validatePassword(loginData.request.newPassword)

            //If both auth code and the new password are ok:
            if (await context.verifyHash(loginData.request.password, loginData.secret?.value.passwordHash!)) {

                //We must create the new user secret:
                loginData.secret = new Secret<UserAccountSecret>(UserAccountSecret)
                loginData.secret.value.passwordHash = await context.createHash(loginData.request.newPassword);

                //Now we must persist the secret and link the user to that secret:
                loginData.user!.secretId = await context.saveUserSecret(loginData.secret);
                loginData.user!.lastLogin = new Date(); //Setting the first login date for the user... Hurray!!.
                await context.saveUser(loginData.user!);
                loginData.accessToken = context.createToken(loginData.user!, loginData.legacySecurity) //All ready to generate and return the token.
            }
            else {
                throw new PropelError(`Wrong password supplied by ${loginData.user?.fullName} (${loginData.user?.name}), Login is denied.`,
                    ErrorCodes.LoginWrongPassword, UNAUTHORIZED.toString());
            }
        }

        return Promise.resolve();
    }

    private async handlePasswordResetLogin(context: SecurityService): Promise<void> {

        let loginData = context.loginData;

        //If the token was already created, we have nothing else to do here:
        if (loginData.accessToken) return Promise.resolve();

        //System Password reset: An Administratoe reset the user password.
        if (loginData.user?.lastLogin && loginData.user?.mustReset) {

            context.validateAuthenticationCode(loginData.request.password) //For a password reset, the "password" in the request 
            //is the auth code.
            context.validatePassword(loginData.request.newPassword)

            //If the auth code is ok:
            if (await context.verifyHash(loginData.request.password, loginData.secret?.value.passwordHash!)) {

                //Updating the user secret with the new password:
                loginData.secret!.value.passwordHash = await context.createHash(loginData.request.newPassword);
                await context.saveUserSecret(loginData.secret!);

                loginData.user!.mustReset = false; //Removing the "mustReset" flag.
                loginData.user!.lastLogin = new Date();
                await context.saveUser(loginData.user!); //Saving the changes.

                //Now we can create and return the new token:
                loginData.accessToken = context.createToken(loginData.user, loginData.legacySecurity)
            }
            else {
                throw new PropelError(`Wrong password supplied by ${loginData.user?.fullName} (${loginData.user?.name}), Login is denied.`,
                    ErrorCodes.LoginWrongPassword, UNAUTHORIZED.toString());
            }
        }

        return Promise.resolve();
    }

    private async createHash(password: string): Promise<string> {
        const saltRounds = 10;
        let salt = await bcrypt.genSalt(saltRounds);
        return bcrypt.hash(password, salt);
    }

    private async verifyHash(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
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

    private async createRefreshToken(loginData: LoginData<SecurityRequest>):Promise<string> {
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
        return nanoid(cfg.authorizationCodeLength);
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
     * User secret
     */
    public secret: Secret<UserAccountSecret> | undefined

    /**
     * Access token generated after authentication.
     */
    public accessToken: string = ""

    /**
     * Refresh token tied to user session.
     */
    public refreshToken: string = ""

    /**
     * Indicate if legacy security is enabled in Propel. This is for backward compatibility only.
     * User security will be automatically turned off as soon at least one user account 
     * with Administrator role is added and logged in successfully.
     */
    public legacySecurity: boolean = false
}