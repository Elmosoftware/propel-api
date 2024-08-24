// @ts-check
import express from "express";
import { Route } from "../core/route";
import { cfg } from "../core/config";
import { pool } from "../services/powershell-service-pool";
import { usageStatsService } from "../services/usage-stats-service";
import { APIStatus } from "../../propel-shared/models/api-status";
import { logger } from "../services/logger-service";
import { SecurityRule } from "../core/security-rule";
import { REQUEST_TOKEN_KEY } from "../core/middleware";
import { SecurityToken } from "../../propel-shared/core/security-token";
import { systemJobService } from "../services/system-job-service";

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
            ret.workflowSchedulesEnabled = cfg.workflowSchedulesEnabled;

            res.json(ret);
        });

        handler.get("/stats", async (req, res) => {
            res.json(usageStatsService.currentStats);
        });

        handler.get("/user-stats", async (req, res) => {
            let token: SecurityToken = (req as any)[REQUEST_TOKEN_KEY];
            res.json(await usageStatsService.getUserStats(token));
        });

        handler.get("/system-jobs", async (req, res) => {
            res.json(systemJobService.getJobs());
        });

        handler.get("/system-job-logs/:jobName", async (req, res) => {
            let jobName: string = req.params.jobName;
            res.json(systemJobService.getJobLogs(jobName));
        });

        return handler;
    }
}
