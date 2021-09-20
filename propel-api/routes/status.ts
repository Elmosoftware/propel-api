// @ts-check
import express from "express";
import { Route } from "./route";
import { cfg } from "../core/config";
import { pool } from "../services/invocation-service-pool";
import { usageStatsService } from "../services/usage-stats-service";
import { APIResponse } from "../../propel-shared/core/api-response";
import { UsageStats } from "../../propel-shared/models/usage-stats";
import { APIStatus } from "../../propel-shared/models/api-status";

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

            let ret = new APIStatus();
            ret.environmentName = cfg.environment;
            ret.loggingLevel = cfg.logLevel;
            ret.logName = cfg.logName;
            ret.logSource = cfg.logSource;
            ret.poolOptions = cfg.poolOptions;
            ret.poolStats = pool.stats;

            res.json(new APIResponse<APIStatus>(null, [ret]));
        });

        handler.get("/stats", (req, res) => {

            let ret = [usageStatsService.currentStats];

            if (ret[0] == null) {
                ret = []
            }

            res.json(new APIResponse<UsageStats>(null, ret as UsageStats[]));
        });

        return handler;
    }
}
