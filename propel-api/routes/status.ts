// @ts-check
import express from "express";
import { Route } from "../core/route";
import { cfg } from "../core/config";
import { pool } from "../services/invocation-service-pool";
import { usageStatsService } from "../services/usage-stats-service";
import { APIResponse } from "../../propel-shared/core/api-response";
import { UsageStats } from "../../propel-shared/models/usage-stats";
import { APIStatus } from "../../propel-shared/models/api-status";
import { logger } from "../services/logger-service";
import { SecurityRule } from "../core/security-rule";

/**
 * Status route. Returns the api stats, metrics, etc.
 * @implements Route.
 */
export class StatusRoute implements Route {

    name: string = "Status";

    path: string = "/api/status";

    security: SecurityRule[] = []; //Status must be of public access, so no security rules needed.

    constructor() {
        logger.logDebug(`Creating route ${this.name} with path "${this.path}"`)
    }

    handler(): express.Router {

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
