// @ts-check
import { ExecutionLog } from "../../../propel-shared/models/execution-log";
import { ExecutionStatus } from "../../../propel-shared/models/execution-status";
import { ExecutionStep } from "../../../propel-shared/models/execution-step";
import { ExecutionTarget } from "../../../propel-shared/models/execution-target";
import { Workflow } from "../../../propel-shared/models/workflow";

export class TestingExecutionLogs {

    constructor() {
    }

    getExecLogs(totalCount: number, quickTaskCount: number, dates: Date[]): ExecutionLog[] {

        let ret: ExecutionLog[] = []
        let qtCounter = 0;

        if (quickTaskCount > totalCount) {
            throw `"quickTaskCount" can't be higher than "totalCount"`;
        }

        if (dates.length != totalCount) {
            throw `the parameter "dates" must have ${totalCount} entries.`
        }

        for (let i = 0; i < totalCount; i++) {
            //We first add the quick tasks, (if any):
            if (qtCounter < quickTaskCount) {
                ret.push(this.createExecutionLog(true, dates[i], i));
                qtCounter++;
            }
            else {
                ret.push(this.createExecutionLog(false, dates[i], i));
            }
        }

        return ret;
    }

    createExecutionLog(forQuickTask: boolean = false, startedAt: Date, identifier: number): ExecutionLog {
        let ret = new ExecutionLog();

        ret.startedAt = startedAt;
        ret.status = ExecutionStatus.Success;
        ret.workflow = new Workflow()

        ret.workflow.name = ((forQuickTask) ? "Quick Task" : "Workflow") + " " + String(identifier);
        ret.workflow._id = String(identifier);
        ret.workflow.isQuickTask = forQuickTask;

        ret.executionSteps.push(new ExecutionStep())
        ret.executionSteps[0].targets.push(new ExecutionTarget())
        ret.executionSteps[0].targets[0].name = `Target ${identifier}`
        ret.executionSteps[0].targets[0].FQDN = `target.${identifier}.com`

        return ret;
    }

}

export let testingExecutionLogs = new TestingExecutionLogs();