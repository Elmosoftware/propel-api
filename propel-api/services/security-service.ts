import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, UNAUTHORIZED, FORBIDDEN } from "http-status-codes";
import { nanoid } from 'nanoid'

import { cfg } from "../core/config";
import { PropelError } from "../../propel-shared/core/propel-error";
import { SecurityRequest } from "../../propel-shared/core/security-request";
import { SecurityToken } from "../../propel-shared/core/security-token";
import { UserRegistrationResponse } from "../../propel-shared/core/user-registration-response";
import { DataService } from "../services/data-service";
import { UserAccount } from "../../propel-shared/models/user-account";
import { UserAccountSecret } from "../../propel-shared/models/user-account-secret";
import { db } from "../core/database";
import { Secret } from "../../propel-shared/models/secret";
import { APIResponse } from "../../propel-shared/core/api-response";
import { QueryModifier } from "../../propel-shared/core/query-modifier";
import { Utils } from '../../propel-shared/utils/utils';
import { ErrorCodes } from '../../propel-shared/core/error-codes';

export class SecurityService {

    /**
     * Holds all the data related to a login process.
     */
    loginData!: LoginData;

    constructor() {
    
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
     * Allows to obtain one particular user account by specifying the user name or 
     * his ID, (both are unique identifiers).
     * @param nameOrId User Name or Identifier.
     * @returns The requested user or the "undefined" value if the user doesn't exists.
     */
    async getUserByIdOrName(nameOrId: string): Promise<UserAccount | undefined> {
        let svc: DataService = db.getService("useraccount");
        let result: APIResponse<UserAccount>;
        let qm = new QueryModifier();

        if (svc.isValidObjectId(nameOrId)) {
            qm.filterBy = { _id: nameOrId }
        }
        else {
            qm.filterBy = { name: { $eq: nameOrId } };
        }        

        result = await svc.find(qm);

        if (result.count == 1) return (result.data[0] as any).toObject();
        else return undefined;
    }

    /**
     * Handle the user login for all the possible scenarios.
     * Scenarios at the moment handled by this method are:
     *  - First login: The user has been created but never login before. The password entered will be hashed and
     * saved as his new on.
     *  - Regular login: The user already have a password set and it would like to login using it.
     *  - System password reset login: The password of the user was resetted by an administrator and 
     * the user need to set a new password on his login.
     * @param request Security request
     * @returns The security token if the user auth process finish successfully.
     * @throws This method is going to throw exceptions under the following conditions:
     *  - **Invalid or missing data** in the security request (**HTTP status 400** Bad request)
     *  - **User doesn't exist** (**HTTP status 401** Unauthorized)
     *  - **User is locked** (**HTTP status 403** Forbidden)
     *  - **User doesn't have a secret when is expected**, (unlikely to happen) (**HTTP Status 500** Internal server error).
     *  - **Wrong password** (**HTTP status 401** Unauthorized)
     */
    async handleUserLogin(request: SecurityRequest): Promise<string> {

        this.loginData = new LoginData(request);

        //The user login process is complex and made by different use cases. We manage to handle this 
        //with the below methods they are executin sequentially but in async way and they are filling the 
        // "loginData" until the point the authentication succeed or fail: 
        let toEval = [
            /**
             * Retrieves the user information and verify if the user is not locked.
             */
            this.getAndVerifyUser,
            /**
             * Retrieve the user secret,(if any is already set).
             */
            this.getAndVerifyUserSecret,
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

        await Utils.asyncForEach(toEval, async (func: Function, i: number) => {
            this.loginData = await toEval[i](this);
        })

        return Promise.resolve(this.loginData.token);
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

        let user: UserAccount | undefined = await this.getUserByIdOrName(nameOrId);
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


    async lockUser(nameOrId: string): Promise<string> {
        return this.internalLockOrUnlockUser(nameOrId, true)
    }

    async unlockUser(nameOrId: string): Promise<string> {
        return this.internalLockOrUnlockUser(nameOrId, false)
    }

    private async internalLockOrUnlockUser(nameOrId: string, mustLock: boolean): Promise<string> {

        let user: UserAccount | undefined = await this.getUserByIdOrName(nameOrId);

        this.throwIfNoUser(user, nameOrId, `The ${(mustLock) ? "lock" : "unlock"} user operation will be aborted.`)

        if (mustLock) {
            user!.lockedSince = new Date();
        }
        else {
            user!.lockedSince = null;
        }

        return this.saveUser(user!);
    }

    private throwIfNoUser(user: UserAccount | undefined, nameOrId: string, additionalInfo: string = ""): void {
        if (!user) throw new PropelError(`No user with Name or ID "${nameOrId}" was found. ${additionalInfo}`,
            undefined, INTERNAL_SERVER_ERROR.toString()); {
        }
    }

    private validateSecurityRequest(context: SecurityService, validateNewPassword: boolean = false): void {

        let loginData = context.loginData;

        if (!loginData.request?.userNameOrId || !loginData.request?.password) {
            throw new PropelError(`Bad format in the request body, we expect the user name or id and the user password. 
            Property "userNameOrId": ${(loginData.request?.userNameOrId) ? "is present" : "Is missing"}, Property "password": ${(loginData.request?.password) ? "is present" : "Is missing"}.`, 
                undefined, BAD_REQUEST.toString());
        }

        if (validateNewPassword && !loginData.request?.newPassword) {
            throw new PropelError(`Bad format in the request body, we expect the new user password. 
            Property "newPassword": ${(loginData.request?.newPassword) ? "is present" : "Is missing"}.`, 
                undefined, BAD_REQUEST.toString());
        }
    }

    private async getAndVerifyUser(context: SecurityService): Promise<LoginData> {

        let loginData = context.loginData;

        context.validateSecurityRequest(context);

        loginData.user = await context.getUserByIdOrName(loginData.request.userNameOrId);
        
        context.throwIfNoUser(loginData.user, loginData.request.userNameOrId);
        
        //If the user is locked, we must prevent the user to login.
        if(loginData.user?.lockedSince){
            throw new PropelError(`The user "${loginData.request.userNameOrId}" is locked.`, 
                ErrorCodes.LoginLockedUser, FORBIDDEN.toString());
        } 

        return Promise.resolve(loginData);
    }

    private async getAndVerifyUserSecret(context: SecurityService): Promise<LoginData> {

        let loginData = context.loginData;

        context.validateSecurityRequest(context);

        //If the user doesn't have a secret Id yet there is nothing else to do: 
        if (!loginData.user?.secretId) return Promise.resolve(loginData)

        loginData.secret = await context.getUserSecret(loginData.user.secretId);

            /*
                Note: This is a very unlikely case, but er need to check anyway because 
                the login can't complete if we don't have the current user secret!.
                If the secretisgone for some reason, the only option is that one administrator
                reset his password or even to null the "lastLogin" date so the user can do 
                a first login again. 
            */
            if (!loginData.secret) {
                throw new PropelError(`No secret was found for user with Name or ID "${loginData.request?.userNameOrId}". 
                The specified User secret with id:"${loginData.user?.secretId}" doesn't exists. Property "mustReset" is "${String(loginData.user?.mustReset)}".
                Will require a System admin to reset user password.`, 
                    undefined, INTERNAL_SERVER_ERROR.toString());
            }

        return Promise.resolve(loginData);
    }

    private async handleFirstLogin(context: SecurityService): Promise<LoginData> {

        let loginData = context.loginData;        

        //If the token was already created, we have nothing else to do here:
        if (loginData.token) return Promise.resolve(loginData);

        context.validateSecurityRequest(context);

        //2nd CASE: First login ever.
        //The user never login before and therefore doesn't have a secret created yet.
        if (!loginData.secret && !loginData.user?.lastLogin) {

            //First we must create the user secret:
            loginData.secret = new Secret<UserAccountSecret>(UserAccountSecret)
            loginData.secret.value.passwordHash = await context.createHash(loginData.request.password);

            //Now we must persist the secret and link the user to that secret:
            loginData.user!.secretId = await context.saveUserSecret(loginData.secret); //Associating the secret to the user.
            loginData.user!.lastLogin = new Date(); //Setting the first login date for the user... Hurray!!.
            await context.saveUser(loginData.user!);

            //Now we have all ready to create and return the token:
            loginData.token = context.createToken(loginData.user!)    
        }

        return Promise.resolve(loginData);
    }

    private async handleRegularLogin(context: SecurityService): Promise<LoginData> {

        let loginData = context.loginData;        

        //If the token was already created, we have nothing else to do here:
        if (loginData.token) return Promise.resolve(loginData);

        context.validateSecurityRequest(context);

        //3rd CASE: Regular login.
        //The user already have a secret and the "mustReset" flag is not set.
        if (loginData.secret && !loginData.user?.mustReset) {

            //If the password is ok, we must return the token and update the user last login:
            if(await context.verifyHash(loginData.request.password, loginData.secret.value.passwordHash)){
                
                loginData.user!.lastLogin = new Date();
                await context.saveUser(loginData.user!);
                loginData.token = context.createToken(loginData.user!) 
            }
            else {
                throw new PropelError(`Wrong password supplied by ${loginData.user?.fullName} (${loginData.user?.name}), Login is denied.`, 
                    ErrorCodes.LoginWrongPassword, UNAUTHORIZED.toString());
            }            
        }

        return Promise.resolve(loginData);
    }

    private async handlePasswordResetLogin(context: SecurityService): Promise<LoginData> {

        let loginData = context.loginData;        

        //If the token was already created, we have nothing else to do here:
        if (loginData.token) return Promise.resolve(loginData);

        context.validateSecurityRequest(context, true);

        //4th CASE: System Password reset -> An Admin reset the user password.
        //The user already have a secret and the "mustReset" flag is set.
        if (loginData.secret && loginData.user?.mustReset) {

            //If the current password is ok:
            if(await context.verifyHash(loginData.request.password, loginData.secret.value.passwordHash)){
                //Now we can proceed to set the new password:
                
                //First we must update the user secret with the new password hash:
                loginData.secret.value.passwordHash = await context.createHash(loginData.request.newPassword);
                await context.saveUserSecret(loginData.secret);

                loginData.user!.mustReset = false; //Removing the "mustReset" flag.
                loginData.user!.lastLogin = new Date();
                await context.saveUser(loginData.user!); //Saving the changes.

                //Now we can create and return the new token:
                loginData.token = context.createToken(loginData.user!) 
            }
            else {
                throw new PropelError(`Wrong password supplied by ${loginData.user?.fullName} (${loginData.user?.name}), Login is denied.`, 
                    ErrorCodes.LoginWrongPassword, UNAUTHORIZED.toString());
            }            
        }

        return Promise.resolve(loginData);
    }

    private async createHash(password: string): Promise<string> {
        const saltRounds = 10;
        let salt = await bcrypt.genSalt(saltRounds);
        return bcrypt.hash(password, salt);
    }

    private async verifyHash(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    private createToken(user: UserAccount): string {
        let dataPayload = new SecurityToken(user);
        let options = {
            expiresIn: cfg.tokenExpiration
        }

        return jwt.sign({
            data: dataPayload
        }, cfg.encryptionKey, options);
    }

    private async getUserSecret(secretId: string): Promise<Secret<UserAccountSecret> | undefined> {
        let svc: DataService = db.getService("secret");
        let result: APIResponse<Secret<UserAccountSecret>>;
        let qm = new QueryModifier();

        qm.filterBy = { _id: secretId }
        
        result = await svc.find(qm);

        if (result.count == 1) return (result.data[0] as any).toObject();
        else return undefined;
    }

    private async createNewSecret(passwordOrAuthCode: string): Promise<string> {

        let secret = new Secret<UserAccountSecret>(UserAccountSecret)
        secret.value.passwordHash = await this.createHash(passwordOrAuthCode);

        //Now we must persist the secret and return the secret id:
        return await this.saveUserSecret(secret);
    }

    private async saveUserSecret(secret: Secret<UserAccountSecret>): Promise<string> {
        let svc: DataService = db.getService("secret");
        let result: APIResponse<string>;

        //If is a new secret:
        if (!secret._id) {
            result = await svc.add(secret);
        }
        else {
            result = await svc.update(secret);
        }

        if (result.count == 1) return result.data[0].toString();
        else throw new PropelError(`There was an error creating or updating the user secret. Following details: ${JSON.stringify(result.errors[0])}`)
    }

    private async saveUser(user: UserAccount): Promise<string> {
        let svc: DataService = db.getService("useraccount");
        let result: APIResponse<string>;

        //If is a new user:
        if (!user._id) {
            result = await svc.add(user);
        }
        else {
            result = await svc.update(user);
        }

        if (result.count == 1) return result.data[0].toString();
        else throw new PropelError(`There was an error creating or updating the user. Following details: ${JSON.stringify(result.errors[0])}`, 
            undefined, INTERNAL_SERVER_ERROR.toString())
    }

    private createAuthCode(): string {
        return nanoid(6);
    }
}

/**
 * Internal class used to hold all the data involved in the login process.
 */
class LoginData {

    constructor(request: SecurityRequest) {
        this.request = request;
    }

    /**
     * Security request data with all the information for the login.
     */
    public request: SecurityRequest = new SecurityRequest();

    /**
     * User that is requesting the login.
     */
    public user?: UserAccount;

    /**
     * User secret
     */
    public secret?: Secret<UserAccountSecret>

    /**
     * Token generated after authentication.
     */
    public token: string = ""
}