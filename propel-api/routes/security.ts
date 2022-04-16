// @ts-check
import express from "express";
import { INTERNAL_SERVER_ERROR } from "http-status-codes";

import { Route } from "./route";
import { APIResponse } from "../../propel-shared/core/api-response";
import { PropelError } from "../../propel-shared/core/propel-error";
import { SecurityService } from "../services/security-service";
import { SecurityRequest } from "../../propel-shared/core/security-request";
import { UserAccount } from "../../propel-shared/models/user-account";
import { UserRegistrationResponse } from "../../propel-shared/core/user-registration-response";
import { SecuritySharedConfiguration } from "../../propel-shared/core/security-shared-config";

/**
 * Security route implements security related features like, user login and user managment.
 * @implements Route.
 */
export class SecurityRouter implements Route {

    constructor() {
    }

    route(): express.Router {

        const handler = express.Router();

        //Returning the shared configuration of the security endpoint:
        handler.get("", (req, res) => {
            let ss: SecurityService = new SecurityService();

            try {
                res.json(new APIResponse<SecuritySharedConfiguration>(null, ss.getSharedConfig()));
            } catch (error) {
                this.handleError(res, error);
            }
        });

        //Get user by id or name:
        handler.get("/user/:id", async (req, res) => {

            let ss: SecurityService = new SecurityService();
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

            let ss: SecurityService = new SecurityService();
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

            let ss: SecurityService = new SecurityService();
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

            let ss: SecurityService = new SecurityService();
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

            let ss: SecurityService = new SecurityService();
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

            let ss: SecurityService = new SecurityService();
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

        res.status(code).json(new APIResponse<any>(error, null));
    }
}
