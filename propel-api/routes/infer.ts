// @ts-check
import express from "express";
import httpstatus from "http-status-codes";

import { Route } from "./route";
import { InferenceService } from "../services/inference-service";
import { ScriptParameter } from "../../propel-shared/models/script-parameter";
import { APIResponse } from "../../propel-shared/core/api-response";
import { logger } from "../services/logger-service";

/**
 * Script parameters inference endpoint. Allows to the API to support parameters inference 
 * for the scripts.
 * @implements Route.
 */
export class InferRouter implements Route {

    constructor() {
    }

    route(): express.Router {

        const handler = express.Router();

        handler.post("", (req, res) => {

            let infsvc = new InferenceService();

            logger.logDebug(`Starting inference of script parameters. Body Sent:\r\n"${req.body}".`)
            
            infsvc.infer(req.body)
                .then((params: ScriptParameter[]) => {
                    logger.logDebug(`Script parameters inference process finished with the following results: "${(params) ? JSON.stringify(params) : "null or empty array"}".`)
                    res.json(new APIResponse(null, params));
                })
                .catch((err) => {
                    logger.logError(`There was an error returned by the Script parameters inference process. Error details: "${String(err)}".`);
                    res.status(httpstatus.BAD_REQUEST).json(new APIResponse(err, null));
                })
        });

        return handler;
    }
}
