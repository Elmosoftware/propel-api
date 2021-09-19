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

const TOP_USED_WORKFLOWS: number = 5;
const TOP_LATEST_EXECUTIONS: number = 5;
const TOP_LAST_ERRORS: number = 5;

/**
 * This class is responsible to create the application usage statistics.
 */
export class UsageStatsService {

    private _stats: UsageStats;

    /**
     * Return the current application usage stats.
     */
    get currentStats(): UsageStats {
        return Object.assign({}, this._stats);
    }

    constructor() {
        this._stats = new UsageStats();
    }

    /**
     * Trigger a full update of the application usage stats.
     */
    async updateStats(): Promise<void> {

        let allExecLogs: ExecutionLog[] = await this.getAllExecutionLogs();
        let currentDate: Date = Utils.removeTimeFromDate();
        let daysCounter: number = 1;

        this._stats.totalExecutions = allExecLogs.length;
        this._stats.totalWorkflows = await this.getAllWorkflowsCount();
        this._stats.totaltargets = await this.getAllTargetsCount();
        this._stats.totalScripts = await this.getAllScriptsCount();
        this._stats.totalCredentials = await this.getAllCredentialsCount();

        //Adding 2 series, one for workflows and the other for Quick Tasks:
        this._stats.dailyExecutions.push(new GraphSeries("Workflows"));
        this._stats.dailyExecutions.push(new GraphSeries("Quick Tasks"));
        this.createDailyExecutionsSeriesData(currentDate);

        allExecLogs.forEach((log: ExecutionLog) => {

            //Daily executions:
            //=================
            log.startedAt = Utils.removeTimeFromDate(log.startedAt);

            while (log.startedAt < currentDate) {
                currentDate = Utils.addDays(currentDate, -1);
                daysCounter++;
                this.createDailyExecutionsSeriesData(currentDate);
            }

            if (log.startedAt.toUTCString() == currentDate.toUTCString()) {
                //Increasing in one the right series:
                this.increaseDailyExecutionsLastSeriesValue(this._stats.dailyExecutions[(log.workflow.isQuickTask) ? 1 : 0])
            }

            //Most used Workflows:
            //====================
            if (!log.workflow.isQuickTask) {
                this.addMostUsedWorkflowsSeriesData(log.workflow)
            }

            //Latest Executions:
            //==================
            if (this._stats.latestExecutions.length < TOP_LATEST_EXECUTIONS) {
                this._stats.latestExecutions.push(new GraphSeriesData(log.workflow.name, 1,
                    log._id, log.startedAt));
            }

            //Last Execution errors:
            //======================
            if (this._stats.lastExecutionErrors.length < TOP_LAST_ERRORS) {

                log.executionSteps
                    .map((executionStep) => executionStep.targets
                        .map((execTarget) => {
                            if (execTarget.execErrors.length > 0) {
                                this._stats.lastExecutionErrors
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
            this.createDailyExecutionsSeriesData(currentDate);
        }

        this._stats.mostUsedWorkflows = this._stats.mostUsedWorkflows
            .sort((sd1, sd2) => sd2.value - sd1.value) //Sorting in descending order
            .splice(0, TOP_USED_WORKFLOWS) //Keeping only the top of them.

        this._stats.latestExecutions = this._stats.latestExecutions
            .splice(0, TOP_LATEST_EXECUTIONS)
    }

    private async getAllExecutionLogs(): Promise<ExecutionLog[]> {

        let svc: DataService = db.getService("ExecutionLog")
        let qm = new QueryModifier();

        qm.populate = true;
        qm.sortBy = "-startedAt";

        return (await svc.find(qm)).data
            .map((model) => model.toObject());
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
        qm.filterBy = {
            isQuickTask: { $eq: false }
        }

        return (await svc.find(qm)).totalCount;
    }

    private async getAllTargetsCount(): Promise<number> {
        let svc: DataService = db.getService("Target")
        let qm = new QueryModifier();

        qm.top = 1;
        qm.skip = 0;
        qm.populate = false;
        qm.filterBy = {
            isQuickTask: { $eq: false }
        }

        return (await svc.find(qm)).totalCount;
    }

    private async getAllCredentialsCount(): Promise<number> {
        let svc: DataService = db.getService("Credential")
        let qm = new QueryModifier();

        qm.top = 1;
        qm.skip = 0;
        qm.populate = false;
        qm.filterBy = {
            isQuickTask: { $eq: false }
        }

        return (await svc.find(qm)).totalCount;
    }

    private createDailyExecutionsSeriesData(forDate: Date): void {
        let name: string = forDate.toLocaleString("default", { month: "long", day: "numeric" })
            + Utils.getOrdinalSuffix(forDate.getDate())
        //Adding a new entry with value "0" for both series, Workflows and Quick Tasks:
        this._stats.dailyExecutions[0].series.push(new GraphSeriesData(name, 0, "", forDate));
        this._stats.dailyExecutions[1].series.push(new GraphSeriesData(name, 0, "", forDate));
    }

    private increaseDailyExecutionsLastSeriesValue(series: GraphSeries, value: number = 1): void {

        if (series.series.length == 0) {
            throw new PropelError("There is no Series data added. The update of last element is not possible.")
        }
        else {
            series.series[series.series.length - 1].value += value;
        }
    }

    private addMostUsedWorkflowsSeriesData(forWorkflow: Workflow): void {
        let sd = this._stats.mostUsedWorkflows.find((item) => item._id == forWorkflow._id)

        if (sd) {
            sd.value++;
        }
        else {
            this._stats.mostUsedWorkflows.push(new GraphSeriesData(forWorkflow.name, 1, forWorkflow._id))
        }
    }
}

export let usageStatsService = new UsageStatsService();