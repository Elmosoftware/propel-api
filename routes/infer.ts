// @ts-check
import express from "express";
import httpstatus from "http-status-codes";

import { Route } from "./route";
import { InferenceService } from "../services/inference-service";
import { ScriptParameter } from "../models/script-parameter";
import { logger } from "../services/logger-service";
import { APIResponse } from "../core/api-response";

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
            
            infsvc.infer(req.body)
                .then((params: ScriptParameter[]) => {
                    res.json(new APIResponse(null, params));
                })
                .catch((err) => {
                    res.status(httpstatus.BAD_REQUEST).json(new APIResponse(err, null));
                })
                .finally(() => {
                    infsvc.dispose()
                        .then(() => { })
                        .catch((err) => {
                            logger.logError(`There was an error disposing an instance of the InferenceService. 
If this keep going can cause a memory leak by lots of PowerShell instances kept in memory.\n Error details: ${String(err)}`);
                        })
                })
        });

        return handler;
    }
}
