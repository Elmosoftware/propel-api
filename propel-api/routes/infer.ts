// @ts-check
import express from "express";
import httpstatus from "http-status-codes";

import { Route } from "../core/route";
import { ParamInferenceService } from "../services/param-inference-service";
import { ScriptParameter } from "../../propel-shared/models/script-parameter";
import { logger } from "../services/logger-service";
import { AuthStatus, RulePreventLogic, SecurityRule } from "../core/security-rule";
import { UserAccountRoles } from "../../propel-shared/models/user-account-roles";
import { PropelError } from "../../propel-shared/core/propel-error";

/**
 * Script parameters inference endpoint. Allows to the API to support parameters inference 
 * for the scripts.
 * @implements Route.
 */
export class InferRoute implements Route {

    name: string = "InferScriptParams";

    path: string = "/api/infer";

    security: SecurityRule[] = [
        {
            matchFragment: "/*", 
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [AuthStatus.Anonymous, UserAccountRoles.User],
            preventLogic: RulePreventLogic.Or,
            text: `This rule prevents non auth or regular users to infer script parameters, (regular users can't create or modify scripts).`
        }
    ];

    constructor() {
        logger.logDebug(`Creating route ${this.name} with path "${this.path}"`)
    }

    handler(): express.Router {

        const handler = express.Router();

        handler.post("", async (req, res) => {
            try {
                let infsvc = new ParamInferenceService();
                res.json(await infsvc.infer(req.body));
            } catch (error) {
                logger.logError(`There was an error returned by the Script parameters inference process. Error details: "${String(error)}".`);
                this.handleError(res, error)
            }
        });

        return handler;
    }

    handleError(res: express.Response, error: any) {
        error = new PropelError(error);
        let code: number = Number(error.httpStatus) || httpstatus.BAD_REQUEST;
        res.status(code).json(error);
    }
}
