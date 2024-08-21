import { SystemJob, SystemJobUnits, SystemJobLogEntry } from "./system-job";
import { ScheduleCalculator } from "../../propel-shared/core/schedule-calculator";
import { db } from "../core/database";
import { DataService } from "../services/data-service";
import { SecurityService } from "../services/security-service";
import { QueryModifier } from "../../propel-shared/core/query-modifier";
import { PagedResponse } from "../../propel-shared/core/paged-response";
import { Workflow } from "../../propel-shared/models/workflow";
import { SharedSystemHelper } from "../../propel-shared/utils/shared-system-helper";
import { SecurityToken } from "../../propel-shared/core/security-token";
import { UserAccount } from "../../propel-shared/models/user-account";
import { RunnerServiceData } from "../../propel-shared/core/runner-service-data";
import { Runner } from "../services/runner-service";
import { ExecutionStats, WebsocketMessage } from "../../propel-shared/core/websocket-message";
import { logger } from "../services/logger-service";

/**
 * System job definition for the Workflow Schedule Manager.
 * This job, on each cycle, review all the Workflows that have an active schedule and check 
 * his next scheduled execution. If is due, it will fire & forget the workflow. 
 */
export class ScheduleManagerSystemJob implements SystemJob {
    readonly name: string = "Schedule Manager";

    readonly description: string = "This job takes care of running Workflows based on his schedule.";
    
    readonly unit: SystemJobUnits = SystemJobUnits.Minutes;
    
    readonly every: number = 1;
    
    readonly runImmediately: boolean = false;

    private token!: SecurityToken;

    async command(): Promise<SystemJobLogEntry | SystemJobLogEntry[] | undefined> {
        let now: Date = new Date()
        let logs: SystemJobLogEntry[] = []
        let workflows: Workflow[];

        this.updateToken();
        logger.logDebug(`Retrieving all workflows with active schedules`)
        workflows = await this.getAllWorkflowsWithActiveSchedules()
        
        logs.push({
            ts: new Date(),
            msg: `Fetched ${workflows.length} workflows with an active schedule.`,
            isError: false
        })

        logger.logDebug(`${workflows.length} workflows with active schedules found.`)
        workflows.forEach(async (w) => {
            let nextRun: Date | null = ScheduleCalculator.getNextRun(w.schedule)

            if (!nextRun) {
                logger.logDebug(`Workflow "${w.name}" has no next run scheduled.`)
            }
            else if(SharedSystemHelper.isBefore(nextRun, now)) {
                logger.logDebug(`Workflow "${w.name}" is due to start: ${this.dateToLocalAndUTC(nextRun)}`)
                logs.push({
                    ts: new Date(),
                    msg: `Starting execution of Workflow "${w.name}" ...`,
                    isError: false
                })
                
                logger.logDebug(`Firing Workflow "${w.name}" execution...`)
                this.runWorkflow(w); //Just fire and forget...
                
                w.schedule.lastExecution = new Date();
                logs.push({
                    ts: new Date(),
                    msg: `Updating last execution to ${this.dateToLocalAndUTC(w.schedule.lastExecution)}.`,
                    isError: false
                })
                logger.logDebug(`Updating Workflow "${w.name}" last execution to ${this.dateToLocalAndUTC(w.schedule.lastExecution)}`)
                await this.updateWorkflow(w)
            }
            else {
                logger.logDebug(`Workflow "${w.name}" next execution is in the future, no action needed: ${this.dateToLocalAndUTC(nextRun)}.`)
            }
        })     
        
        return logs
    }

    private async runWorkflow(w: Workflow): Promise<WebsocketMessage<ExecutionStats>> {
        let data: RunnerServiceData = new RunnerServiceData(w._id, [], true)
        let runner: Runner = new Runner();

        return runner.execute(data, this.token)
    }

    private async getAllWorkflowsWithActiveSchedules(): Promise<Workflow[]> {
        let svc: DataService = db.getService("Workflow", this.token)
        let qm = new QueryModifier();
        let result: PagedResponse<Workflow>

        qm.populate = true;
        qm.filterBy = {
            "schedule.enabled": true
        }        
        
        result = await svc.find(qm) as PagedResponse<Workflow>;
        return Promise.resolve(result.data);
    }

    private async updateWorkflow(workflow: Workflow): Promise<string> {
        let svc: DataService = db.getService("Workflow", this.token)

        return svc.update(workflow);
    }

    private dateToLocalAndUTC(d: Date | null): string {
        if(!d) return ""
        return `${d.toLocaleString()} (UTC:${d.toISOString()})`
    }

    private updateToken() {
        let security: SecurityService = new SecurityService()
        let sysAccount: UserAccount = security.getSystemUser()
        this.token = new SecurityToken();
        this.token.hydrateFromUser(sysAccount);
    }
}