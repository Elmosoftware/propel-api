import { db } from "../core/database";
import { DataService } from "../services/data-service";
import { ExecutionLog } from "../../propel-shared/models/execution-log";
import { UsageStats } from "../../propel-shared/models/usage-stats";
import { QueryModifier } from "../../propel-shared/core/query-modifier";
import { GraphSeries } from "../../propel-shared/models/graph-series";
import { GraphSeriesData } from "../../propel-shared/models/graph-series-data";
import { PropelError } from "../../propel-shared/core/propel-error";
import { Utils } from "../../propel-shared/utils/utils";
import { cfg } from "../core/config";
import { Workflow } from "../../propel-shared/models/workflow";
import { logger } from "./logger-service";
import { SecurityToken } from "../../propel-shared/core/security-token";
import { PagedResponse } from "../../propel-shared/core/paged-response";

const TOP_USED_WORKFLOWS: number = 5;
const TOP_LATEST_EXECUTIONS: number = 5;
const TOP_LAST_ERRORS: number = 5;

/**
 * This class is responsible to create the application usage statistics.
 */
export class UsageStatsService {

    private _stats!: UsageStats;
    private _updatingStats: boolean = false;

    /**
     * Return the current application usage stats or no value if the stats are not created yet.
     * If there is no stats or they are stale, it will take care also to schedule a refresh..
     */
    get currentStats(): UsageStats {

        if (this.areStatsStale) {
            
            if (this._stats) {
                this._stats.areStale = true;
            }

            let start: number = (new Date()).getTime();
            
            this.updateStats()
                .then(() => {
                    logger.logDebug(`Propel usage statistics updated at ` + 
                    this._stats?.statsTimestamp.toLocaleString() + 
                    ` (took ${((new Date()).getTime() - start)/1000} seconds).`)
                })
                .catch((err) => {
                    logger.logError(`Propel usage statistics failed to update. Error was: ${String(err)}`)
                })
        }

        return this._stats;
    }

    constructor() {

    }

    /**
     * Return a Boolean value indicating if the current stats must be considered stale.
     * If stats has not been calculated yet, this will return also true.
     */
    get areStatsStale(): boolean {
        let statsAge: number;

        if (!this._stats) return true;
        statsAge = ((new Date()).getTime() - this._stats.statsTimestamp.getTime())/1000/60

        return statsAge >= cfg.usageStatsStaleMinutes;
    }

    /**
     * Trigger a full update of the application usage stats.
     * In this way you can force stats recalculation. Normal procedure is just to pick the 
     * current stats. The *currentStats* getter will trigger the stats recalculation process
     * if the stats are not yet created or they are stale.
     */
    async updateStats(): Promise<void> {

        let allExecLogs: ExecutionLog[];
        let currentDate: Date = Utils.removeTimeFromDate();
        let daysCounter: number = 1;
        let stats = new UsageStats();

        //If the stats are in progress to be updated, we must do nothing.
        if (this._updatingStats) return;

        try {
            this._updatingStats = true;
            allExecLogs = await this.getAllExecutionLogs();

            stats.totalExecutions = allExecLogs.length;
            stats.totalWorkflows = await this.getAllWorkflowsCount();
            stats.totalTargets = await this.getAllTargetsCount();
            stats.totalScripts = await this.getAllScriptsCount();
            stats.totalCredentials = await this.getAllCredentialsCount();

            //Adding 2 series, one for workflows and the other for Quick Tasks:
            stats.dailyExecutions.push(new GraphSeries("Workflows"));
            stats.dailyExecutions.push(new GraphSeries("Quick Tasks"));
            this.createDailyExecutionsSeriesData(stats, currentDate);

            allExecLogs.forEach((log: ExecutionLog) => {

                //Daily executions:
                //=================
                log.startedAt = Utils.removeTimeFromDate(log.startedAt);

                while (log.startedAt < currentDate) {
                    currentDate = Utils.addDays(currentDate, -1);
                    daysCounter++;
                    this.createDailyExecutionsSeriesData(stats, currentDate);
                }

                if (log.startedAt.toUTCString() == currentDate.toUTCString()) {
                    //Increasing in one the right series:
                    this.increaseDailyExecutionsLastSeriesValue(stats.dailyExecutions[(log.workflow.isQuickTask) ? 1 : 0])
                }

                //Most used Workflows:
                //====================
                if (!log.workflow.isQuickTask) {
                    this.addMostUsedWorkflowsSeriesData(stats, log.workflow)
                }

                //Latest Executions:
                //==================
                if (stats.latestExecutions.length < TOP_LATEST_EXECUTIONS) {
                    stats.latestExecutions.push(new GraphSeriesData(log.workflow.name, 1,
                        log._id, log.startedAt, { 
                            status: log.status.toString(),
                            userName: (log?.user) ? log.user.name : "" ,
                            userFullName: (log?.user) ? log.user.fullName : ""
                        }));
                }

                //Last Execution errors:
                //======================
                if (stats.lastExecutionErrors.length < TOP_LAST_ERRORS) {

                    log.executionSteps
                        .map((executionStep) => executionStep.targets
                            .map((execTarget) => {
                                if (execTarget.execErrors.length > 0) {
                                    stats.lastExecutionErrors
                                        .push(new GraphSeriesData(`[${execTarget.name} (${execTarget.FQDN})]: ${execTarget.execErrors[0].message}`,
                                            1, log._id, execTarget.execErrors[0].throwAt))
                                }
                            }))
                }
            })

            //We would like to show the stats for all the duration of the log. So if there is no 
            //older data we will keep addingdatato the series until cover the total days the execution 
            //log entries can be kept:   
            while (daysCounter < cfg.executionLogRetentionDays) {
                currentDate = Utils.addDays(currentDate, -1);
                daysCounter++;
                this.createDailyExecutionsSeriesData(stats, currentDate);
            }

            stats.mostUsedWorkflows = stats.mostUsedWorkflows
                .sort((sd1, sd2) => sd2.value - sd1.value) //Sorting in descending order
                .splice(0, TOP_USED_WORKFLOWS) //Keeping only the top of them.

            stats.latestExecutions = stats.latestExecutions
                .splice(0, TOP_LATEST_EXECUTIONS)

            this._stats = stats;

        } catch (error) {
            return Promise.reject(error);
        }
        finally {
            this._updatingStats = false;
        }
    }

    async getUserStats(token: SecurityToken): Promise<UsageStats> {

        let allExecLogs: ExecutionLog[];
        let stats = new UsageStats();

        try {
            allExecLogs = await this.getAllExecutionLogs(token);

            allExecLogs.forEach((log: ExecutionLog) => {

                //Most used Workflows:
                //====================
                if (!log.workflow.isQuickTask) {
                    this.addMostUsedWorkflowsSeriesData(stats, log.workflow)
                    stats.totalExecutions++;
                }
            })

            stats.mostUsedWorkflows = stats.mostUsedWorkflows
                .sort((sd1, sd2) => sd2.value - sd1.value) //Sorting in descending order
                .splice(0, TOP_USED_WORKFLOWS) //Keeping only the top of them.

        } catch (error) {
            throw error;
        }

        return stats;
    }

    private async getAllExecutionLogs(token?: SecurityToken): Promise<ExecutionLog[]> {

        let svc: DataService = db.getService("ExecutionLog")
        let qm = new QueryModifier();
        let result: PagedResponse<ExecutionLog>

        qm.populate = true;
        qm.sortBy = "-startedAt";

        if (token) {
            qm.filterBy = {
                user: { $eq: token?.userId }
            }        
        }
        
        result = await svc.find(qm) as PagedResponse<ExecutionLog>;
        return Promise.resolve(result.data);
    }

    private async getAllWorkflowsCount(): Promise<number> {
        let svc: DataService = db.getService("Workflow")
        let qm = new QueryModifier();

        qm.top = 1;
        qm.skip = 0;
        qm.populate = false;
        qm.filterBy = {
            isQuickTask: { $eq: false }
        }

        return (await svc.find(qm)).totalCount;
    }

    private async getAllScriptsCount(): Promise<number> {
        let svc: DataService = db.getService("Script")
        let qm = new QueryModifier();

        qm.top = 1;
        qm.skip = 0;
        qm.populate = false;

        return (await svc.find(qm)).totalCount;
    }

    private async getAllTargetsCount(): Promise<number> {
        let svc: DataService = db.getService("Target")
        let qm = new QueryModifier();

        qm.top = 1;
        qm.skip = 0;
        qm.populate = false;

        return (await svc.find(qm)).totalCount;
    }

    private async getAllCredentialsCount(): Promise<number> {
        let svc: DataService = db.getService("Credential")
        let qm = new QueryModifier();

        qm.top = 1;
        qm.skip = 0;
        qm.populate = false;

        return (await svc.find(qm)).totalCount;
    }

    private createDailyExecutionsSeriesData(stats: UsageStats, forDate: Date): void {
        let name: string = forDate.toLocaleString("default", { month: "short", day: "numeric" })
            + Utils.getOrdinalSuffix(forDate.getDate())
        //Adding a new entry with value "0" for both series, Workflows and Quick Tasks:
        stats.dailyExecutions[0].series.push(new GraphSeriesData(name, 0, "", forDate));
        stats.dailyExecutions[1].series.push(new GraphSeriesData(name, 0, "", forDate));
    }

    private increaseDailyExecutionsLastSeriesValue(series: GraphSeries, value: number = 1): void {

        if (series.series.length == 0) {
            throw new PropelError("There is no Series data added. The update of last element is not possible.")
        }
        else {
            series.series[series.series.length - 1].value += value;
        }
    }

    private addMostUsedWorkflowsSeriesData(stats: UsageStats, forWorkflow: Workflow): void {
        let sd = stats.mostUsedWorkflows.find((item) => item._id.toString() == forWorkflow._id.toString())

        if (sd) {
            sd.value++;
        }
        else {
            stats.mostUsedWorkflows.push(new GraphSeriesData(forWorkflow.name, 1, forWorkflow._id.toString()))
        }
    }
}

export let usageStatsService = new UsageStatsService();