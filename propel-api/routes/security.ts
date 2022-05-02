// @ts-check
import express from "express";
import { INTERNAL_SERVER_ERROR } from "http-status-codes";

import { Route } from "../core/route";
import { APIResponse } from "../../propel-shared/core/api-response";
import { PropelError } from "../../propel-shared/core/propel-error";
import { SecurityService } from "../services/security-service";
import { SecurityRequest } from "../../propel-shared/core/security-request";
import { UserAccount } from "../../propel-shared/models/user-account";
import { UserRegistrationResponse } from "../../propel-shared/core/user-registration-response";
import { SecuritySharedConfiguration } from "../../propel-shared/core/security-shared-config";
import { AuthStatus, RulePreventLogic, SecurityRule } from "../core/security-rule";
import { UserAccountRoles } from "../../propel-shared/models/user-account-roles";
import { SecurityToken } from "../../propel-shared/core/security-token";
import { REQUEST_TOKEN_KEY } from "../core/middleware";

/**
 * Security route implements security related features like, user login and user managment.
 * @implements Route.
 */
export class SecurityRoute implements Route {

    name: string = "Security";

    path: string = "/api/security";

    security: SecurityRule[] = [
        {
            matchFragment: "/save",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [AuthStatus.Anonymous, UserAccountRoles.User],
            preventLogic: RulePreventLogic.Or,
            text: `Registering/Update users is forbidden to regular or anonymous users.`
        },
        {
            matchFragment: "/reset",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [AuthStatus.Anonymous, UserAccountRoles.User],
            preventLogic: RulePreventLogic.Or,
            text: `Reset any user password is forbidden to regular or anonymous users.`
        },
        {
            matchFragment: "/lock",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [AuthStatus.Anonymous, UserAccountRoles.User],
            preventLogic: RulePreventLogic.Or,
            text: `Locking/Unlocking users is forbidden to regular or anonymous users.`
        },
        {
            matchFragment: "/unlock",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [AuthStatus.Anonymous, UserAccountRoles.User],
            preventLogic: RulePreventLogic.Or,
            text: `Locking/Unlocking users is forbidden to regular or anonymous users.`
        }
    ];

    constructor() {
    }

    handler(): express.Router {

        const handler = express.Router();

        //Returning the shared configuration of the security endpoint:
        handler.get("", (req, res) => {
            let token: SecurityToken = (req as any)[REQUEST_TOKEN_KEY];
            let ss: SecurityService = new SecurityService(token);

            try {
                res.json(new APIResponse<SecuritySharedConfiguration>(null, ss.getSharedConfig()));
            } catch (error) {
                this.handleError(res, error);
            }
        });

        //Get user by id or name:
        handler.get("/user/:id", async (req, res) => {
            let token: SecurityToken = (req as any)[REQUEST_TOKEN_KEY];
            let ss: SecurityService = new SecurityService(token);
            let id: string = req.params.id;

            try {
                let user = await ss.getUserByName(id);
                res.json(new APIResponse<UserAccount>(null, user));
            } catch (error) {
                this.handleError(res, error);
            }
        });

        //User registration:
        handler.post("/save", async (req, res) => {
            let token: SecurityToken = (req as any)[REQUEST_TOKEN_KEY];
            let ss: SecurityService = new SecurityService(token);
            let user: UserAccount = req.body;

            try {
                let regResponse = await ss.registerOrUpdateUser(user);
                res.json(new APIResponse<UserRegistrationResponse>(null, regResponse));
            } catch (error) {
                this.handleError(res, error);
            }
        });

        //User pasword reset:
        handler.post("/reset/:id", async (req, res) => {
            let token: SecurityToken = (req as any)[REQUEST_TOKEN_KEY];
            let ss: SecurityService = new SecurityService(token);
            let id: string = req.params.id;

            try {
                let regResponse: UserRegistrationResponse = await ss.resetUserPassword(id);
                res.json(new APIResponse<UserRegistrationResponse>(null, regResponse));
            } catch (error) {
                this.handleError(res, error);
            }
        });

        //User lock:
        handler.post("/lock/:id", async (req, res) => {
            let token: SecurityToken = (req as any)[REQUEST_TOKEN_KEY];
            let ss: SecurityService = new SecurityService(token);
            let id: string = req.params.id;

            try {
                let userId = await ss.lockUser(id);
                res.json(new APIResponse<string>(null, userId));
            } catch (error) {
                this.handleError(res, error);
            }
        });

        //User unlock:
        handler.post("/unlock/:id", async (req, res) => {
            let token: SecurityToken = (req as any)[REQUEST_TOKEN_KEY];
            let ss: SecurityService = new SecurityService(token);
            let id: string = req.params.id;

            try {
                let userId = await ss.unlockUser(id);
                res.json(new APIResponse<string>(null, userId));
            } catch (error) {
                this.handleError(res, error);
            }
        });

        //User login:
        handler.post("/login", async (req, res) => {
            let token: SecurityToken = (req as any)[REQUEST_TOKEN_KEY];
            let ss: SecurityService = new SecurityService(token);
            let request: SecurityRequest = req.body;

            try {
                let token = await ss.handleUserLogin(request);
                res.json(new APIResponse<string>(null, token));
            } catch (error) {
                this.handleError(res, error);
            }
        });

        return handler;
    }

    handleError(res: express.Response, error: any) {
        let code: number = INTERNAL_SERVER_ERROR;

        if (typeof error === "object" && error instanceof PropelError && error.httpStatus) {
            code = Number(error.httpStatus);
        }

        //If "error" is not an APIResponse, we need to create one:
        if (!(error instanceof APIResponse || error?.name == "APIResponse" || 
            (error?.constructor && error.constructor?.name == "APIResponse"))) {
            error = new APIResponse<any>(error, null);
        }        

        res.status(code).json(error);
    }
}
