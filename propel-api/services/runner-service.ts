import { pool } from "../services/invocation-service-pool";
import { Workflow } from "../../propel-shared/models/workflow";
import { WorkflowStep } from "../../propel-shared/models/workflow-step";
import { ParameterValue } from "../../propel-shared/models/parameter-value";
import { Target } from "../../propel-shared/models/target";
import { InvocationService } from "./invocation-service";
import { InvocationMessage, InvocationStatus, ExecutionStats } from "../../propel-shared/core/invocation-message";
import { PropelError } from "../../propel-shared/core/propel-error";
import { cfg } from "../core/config";
import { ScriptParameter } from "../../propel-shared/models/script-parameter";
import { ErrorCodes } from "../../propel-shared/core/error-codes";
import { ScriptValidator } from "../validators/script-validator";
import { SystemHelper } from "../util/system-helper";
import { ExecutionLog } from "../../propel-shared/models/execution-log";
import { ExecutionStep } from "../../propel-shared/models/execution-step";
import { ExecutionTarget } from "../../propel-shared/models/execution-target";
import { Utils } from "../../propel-shared/utils/utils";
import { ExecutionStatus } from "../../propel-shared/models/execution-status";
import { ExecutionError } from "../../propel-shared/models/execution-error";
import { db } from "../core/database";
import { DataService } from "../services/data-service";
import { APIResponse } from "../../propel-shared/core/api-response";
import { logger } from "./logger-service";

/**
 * This class responsibility is everything related to run a specified workflow and 
 * log any related activities.
 */
export class Runner {

    private _cb: Function | undefined;
    private _scriptVal: ScriptValidator;
    private _localTarget: Target;
    private _execLog: ExecutionLog | undefined;
    private _cancelExecution: boolean;
    private _currentInvocation: InvocationService | null;
    private _stats!: ExecutionStats;

    constructor() {
        this._scriptVal = new ScriptValidator();
        this._localTarget = new Target();
        this._localTarget.FQDN = "localhost"
        this._localTarget.friendlyName = this._localTarget.FQDN;
        this._cancelExecution = false;
        this._currentInvocation = null;
    }

    /**
     * When a Script to run has the _"isTargettingServers"_ with value _"false"_ the script will run 
     * on the local mahine. Thi target represents the **"localhost"** target.  
     */
    get localTarget(): Target {
        return Object.freeze(this._localTarget);
    }

    /**
     * Execution log of the current or last execution
     */
    get executionLog(): ExecutionLog | undefined {
        return this._execLog;
    }

    /**
     * This method takes care of the script execution and returns a promised _"ExecutionLog"_ with all 
     * the execution details.
     * @param workflow The workflow to execute.
     * @param subscriptionCallback A callback function to get any realtime message during the execution.
     */
    async execute(workflow: Workflow, subscriptionCallback?: Function): Promise<InvocationMessage> {
        
        let abort: boolean = false;
        let resultsMessage: InvocationMessage;
        this._cb = subscriptionCallback;
        this._cancelExecution = false;

        //Creating stats:
        this._stats = new ExecutionStats();
        this._stats.workflowName = workflow.name;
        this._stats.totalSteps = workflow.steps.length;
        this._stats.steps = workflow.steps.map((step) => {
            let ret = new ExecutionStep();

            ret.stepName = step.name;
            ret.status = ExecutionStatus.Pending;

            return ret;
        });

        //Creating execution log:
        this._execLog = new ExecutionLog();
        this._execLog.startedAt = new Date();
        this._execLog.workflow = workflow;

        await Utils.asyncForEach(workflow.steps, async (step: WorkflowStep, i: number) => {
            let argsList: string[] = this._buildArgumentList(step);
            let scriptCode: string = this._preprocessScriptCode(step.script.code);
            let execStep: ExecutionStep = new ExecutionStep();
            
            //Updating Execution log:
            execStep.stepName = step.name;
            execStep.scriptName = step.script.name;
            execStep.values = step.values;
            this._execLog?.executionSteps.push(execStep);

            //Updating stats:
            this._stats.currentStep = i + 1;
            this._stats.steps[i].status = ExecutionStatus.Running;

            if (this._cancelExecution) {
                abort = true //Next steps,(if any), will be aborted.
                execStep.status = ExecutionStatus.CancelledByUser;
            }
            else if (abort) {
                execStep.status = ExecutionStatus.Aborted;
            }
            else if (!step.enabled) {
                execStep.status =  ExecutionStatus.Skipped;
            }
            else {
                if (!step.script.isTargettingServers) {
                    //We don't expect any targets here, but anyway we are going to double check
                    //and correct if needed:
                    if (step.targets.length > 0) {
                        step.targets.splice(0, step.targets.length);
                    }

                    step.targets.push(this.localTarget);
                }

                try {
                    execStep.targets = await this._executeOnAllTargets(scriptCode, argsList, step.targets);
                    execStep.status = this._summaryStatus(execStep.targets);
                } catch (error) {
                    execStep.status = ExecutionStatus.Faulty;
                    execStep.execError = new ExecutionError(error);
                }
                
                //If the step has errors and the workflow is configured to abort in that situation:
                if (execStep.status == ExecutionStatus.Faulty && step.abortOnError) {
                    abort = true;
                }
            }

            this._stats.steps[i].status = execStep.status;
        })

        this._execLog.status = this._summaryStatus(this._execLog.executionSteps);
        this._execLog.endedAt = new Date();
        
        try {
            resultsMessage = new InvocationMessage(InvocationStatus.Finished, "","", this._stats);
            resultsMessage.logStatus = this._execLog.status;
            resultsMessage.logId = (await this.saveExecutionLog(this._execLog)).data[0]; 
            this._execLog._id = resultsMessage.logId;
        } catch (error) {
            if (error.errors && error.errors.length > 0) {
                error = error.errors[0]
            }
            let e = new PropelError(error, ErrorCodes.saveLogFailed);
            logger.logError(e);
            resultsMessage = new InvocationMessage(InvocationStatus.Failed, 
                e.errorCode.userMessage, "", this._stats, "", ExecutionStatus.Faulty);
        }

        return resultsMessage;
    }

    async saveExecutionLog(log: ExecutionLog): Promise<APIResponse<string>> {
        let svc: DataService = db.getService("ExecutionLog");
        return svc.add(log);
    }

    /**
     * Calling this method will cancel the workflow execution.
     * @param killProcessIfRunning If this parameter is true, the execution will be stopped 
     * immediattely by killing execution process.
     * if this paramter is false, the execution will be cancelled as soon the current step is done 
     * by preventing next steps to start. 
     */
    cancelExecution(killProcessIfRunning: boolean = false): void {
        this._cancelExecution = true;
        if (killProcessIfRunning && this._currentInvocation && 
            this._currentInvocation.status == InvocationStatus.Running) {
            this._currentInvocation?.disposeSync();
        }
    }

    /**
     * Allows to send a message to the client.
     * @param msg Message to send.
     */
    sendMessage(msg: InvocationMessage) {
        if (this._cb) {
            msg.context = this._stats;
            this._cb(msg);
        }
    }

    private _preprocessScriptCode(encodedScriptCode: string): string {
        let ret: string = "";

        if (encodedScriptCode && typeof encodedScriptCode == "string") {
            ret = SystemHelper.decodeBase64(encodedScriptCode) //Decoding Base64
                .replace(/\t/gi, ` `.repeat(4)) //Tabs can cause issues during script 
                //execution, (see notes), so we are replacing them with spaces. 
        }
        
        /*
            Note: Regarding allowing Tabs, (ASCII 9), character in the script. This can cause some 
            issues when Powershell is reading from the STDIN, (as we use to do when running scripts).
            See the following about:
                https://developercommunity.visualstudio.com/content/problem/901642/tab-character-not-allowed-in-powershell-scripts.html
                https://github.com/PowerShell/PowerShell/issues/13275
                https://github.com/PowerShell/PSReadLine/issues/579
        */
        return ret;
    }

    private _executeOnAllTargets(scriptCode: string, argsList: string[], targets: Target[]) {
        let results: Promise<ExecutionTarget>[] = [];

        targets.forEach((target) => {
            results.push(this._executeOnTarget(scriptCode, argsList, target))
        })

        return Promise.all(results);
    }

    private _executeOnTarget(scriptCode: string, argsList: string[], target: Target): Promise<ExecutionTarget> {
        return new Promise<ExecutionTarget>((resolve, reject) => {

            let et = new ExecutionTarget();
            et.FQDN = target.FQDN;
            et.name = target.friendlyName;

            if (!target.enabled) {
                et.status = ExecutionStatus.Skipped;
                resolve(et);
            }
            else {
                pool.aquire()
                    .then((invsvc: InvocationService) => {

                        this._currentInvocation = invsvc;
                        
                        //Subscribe to the STDOUT event listener:
                        invsvc.addSTDOUTEventListener((msg: InvocationMessage) => {
                            msg.source = target.friendlyName;
                            this.sendMessage(msg);
                        })

                        //Invoke the Script:
                        et.status = ExecutionStatus.Running;
                        invsvc.invoke(this._buildCommand(scriptCode, argsList, target))
                            .then((data: any[]) => {
                                et.status = ExecutionStatus.Success;
                                et.execResults = JSON.stringify(data);
                                this._currentInvocation = null;
                                resolve(et);
                            })
                            .catch((err) => {
                                et.status = ExecutionStatus.Faulty
                                et.execErrors.push(new ExecutionError(this.formatError(err)));
                                this._currentInvocation = null;
                                resolve(et);
                            })
                            .finally(() => {
                                this._currentInvocation = null;
                                pool.release(invsvc);
                            })
                    })
                    .catch((err) => {
                        //There was some issue trying to aquire an object from the pool:
                        this._currentInvocation = null;
                        reject(new PropelError(err));
                    })
            }
        });
    }

    private formatError(e: Error | string): Error | string {
        if (e && e instanceof Error) {
            e.message = Utils.removeANSIEscapeCodes(e.message);
            return e;
        }
        else {
            return Utils.removeANSIEscapeCodes(String(e));
        }
    }

    private _summaryStatus(execs: Array<any>): ExecutionStatus{

        let ret: ExecutionStatus = ExecutionStatus.Success;
        let skippedCount: number = 0;

        execs.forEach((item) => {

            //If the user cancel the execution, the summary state must indicate that.
            if (item.status && item.status == ExecutionStatus.CancelledByUser) {
                ret = ExecutionStatus.CancelledByUser;
            }

            //If there is at least one aborted item, we will summarize the status as "Aborted". At 
            //least that statuswas caused by a user cancellation.
            if (ret != ExecutionStatus.CancelledByUser && item.status && 
                item.status == ExecutionStatus.Aborted) {
                ret = ExecutionStatus.Aborted;
            }

            //If execution wasn't cancelled and there is no Aborted items, but there is at least 
            //one Faulty, we will summarize the status as "Faulty":
            if (ret != ExecutionStatus.CancelledByUser && ret != ExecutionStatus.Aborted && 
                item.status && item.status == ExecutionStatus.Faulty) {
                ret = ExecutionStatus.Faulty;
            }

            //If the execution was skipped item, we will increase the counter:
            if (item.status && item.status == ExecutionStatus.Skipped) {
                skippedCount++;
            }
        })

        //If the item execution was successful, but all the items have been skipped, we 
        //will summarize the status as "Skipped":
        if (ret == ExecutionStatus.Success && skippedCount && skippedCount == execs.length) {
            ret = ExecutionStatus.Skipped;
        }
    
        return ret;
    }

    private _buildArgumentList(step: WorkflowStep): string[] {

        let ret: string[] = [];

        this._scriptVal.reset();

        if (step.script.parameters.length > 0) {

            step.script.parameters.forEach((param: ScriptParameter) => {
                let suppliedParam: ParameterValue | undefined = step.values.find((sp) => sp.name == param.name);
                let value: string = "$null";
                let prefix: string = "";
                let sufix: string = "";

                this._scriptVal.validateParameter(param, suppliedParam);

                if (suppliedParam !== undefined) {
                    value = suppliedParam.value;
                }
                else if (param.hasDefault) {
                    value = param.defaultValue;
                }

                if (param.nativeType == "String") {
                    prefix = `"`;
                    sufix = `"`;
                }

                ret.push(`${prefix}${value}${sufix}`)
            })
        }

        if (!this._scriptVal.isValid) {
            throw new PropelError(`We found one or more errors related to the script "${step.script.name}" parameters and the values assigned to them. Error details:
${this._scriptVal.getErrors()?.message} `, ErrorCodes.WrongParameterData)
        }

        return ret;
    }

    private _buildCommand(scriptCode: string, argList: string[], target: Target): string {

        let ret: string = `$codeBlock = [Scriptblock]::Create(@'\r\n${scriptCode}\r\n'@)\r\nInvoke-Command`;

        /*
            Note: 
                On a development environment there is a lot of times where is not possible to
                invoke a remote computer, so when working on an environment different than prod
                we will hit the local host even when a target is defined.
         */
        if (target && cfg.isProduction) {
            //Also, need to be an script that is actually targetting a remote server :-)
            if (target.FQDN.toLowerCase() !== this.localTarget.FQDN.toLowerCase()) {
                ret += ` -ComputerName ${target.FQDN}`
            }
        }

        ret += ` -ScriptBlock $codeBlock`

        if (argList && argList.length > 0) {
            ret += ` -ArgumentList ${argList.join(", ")}`
        }

        ret += `\r\n` //Recall: we are entering our commands via STDIN. If you don't hit enter at the end, 
        //nothing will run!!! :-)

        logger.logDebug(`Executing command:\r\n${ret}`)

        return ret;
    }
}
