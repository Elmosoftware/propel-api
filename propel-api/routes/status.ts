// @ts-check
import express from "express";
import { Route } from "./route";
import { cfg } from "../core/config";
import { pool } from "../services/invocation-service-pool";

/**
 * Status route. Returns the api stats, metrics, etc.
 * @implements Route.
 */
export class StatusRouter implements Route {

    constructor() {
    }

    route(): express.Router {

        const handler = express.Router();

        handler.get("", (req, res) => {

            let ret = {
                config: {
                    env: cfg.environment,
                    loggingLevel: cfg.logLevel,
                    logName: cfg.logName,
                    logSource: cfg.logSource
                },
                pool: {
                    options: cfg.poolOptions,
                    stats: pool.stats
                }
            }

            res.json(ret);
        });

        return handler;
    }
}
