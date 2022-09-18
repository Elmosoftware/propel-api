// @ts-check
import express from "express";
import { INTERNAL_SERVER_ERROR, NO_CONTENT } from "http-status-codes";

import { Route } from "../core/route";
import { PropelError } from "../../propel-shared/core/propel-error";
import { SecurityService } from "../services/security-service";
import { SecurityRequest } from "../../propel-shared/core/security-request";
import { UserAccount } from "../../propel-shared/models/user-account";
import { AuthStatus, RulePreventLogic, SecurityRule } from "../core/security-rule";
import { UserAccountRoles } from "../../propel-shared/models/user-account-roles";
import { SecurityToken } from "../../propel-shared/core/security-token";
import { REQUEST_TOKEN_KEY } from "../core/middleware";
import { TokenRefreshRequest } from "../../propel-shared/core/token-refresh-request";

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
        handler.get("", async (req, res) => {
            let token: SecurityToken = (req as any)[REQUEST_TOKEN_KEY];
            let ss: SecurityService = new SecurityService(token);

            try {
                res.json(await ss.getSharedConfig());
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
                res.json(await ss.getUserByNameOrID(id));
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
                res.json(await ss.registerOrUpdateUser(user));
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
                res.json(await ss.resetUserPassword(id));
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
                await ss.lockUser(id)
                res.status(NO_CONTENT).send();
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
                await ss.unlockUser(id)
                res.status(NO_CONTENT).send();
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
                res.json(await ss.handleUserLogin(request));
            } catch (error) {
                this.handleError(res, error);
            }
        });

        //Token refresh:
        handler.post("/refresh", async (req, res) => {
            let token: SecurityToken = (req as any)[REQUEST_TOKEN_KEY];
            let ss: SecurityService = new SecurityService(token);
            let request: TokenRefreshRequest = req.body;

            try {
                res.json(await ss.handleTokenRefresh(request));
            } catch (error) {
                this.handleError(res, error);
            }
        });

        //User log off:
        handler.post("/logoff", async (req, res) => {
            let token: SecurityToken = (req as any)[REQUEST_TOKEN_KEY];
            let ss: SecurityService = new SecurityService(token);
            let request: TokenRefreshRequest = req.body;

            try {
                await ss.handleUserLogoff(request);
                res.status(NO_CONTENT).send();
            } catch (error) {
                this.handleError(res, error);
            }
        });

        return handler;
    }

    handleError(res: express.Response, error: any) {
        error = new PropelError(error);
        let code: number = Number(error.httpStatus) || INTERNAL_SERVER_ERROR;
        res.status(code).json(error);
    }
}
