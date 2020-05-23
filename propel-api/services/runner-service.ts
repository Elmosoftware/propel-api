import { pool } from "../services/invocation-service-pool";
import { Workflow } from "../../propel-shared/models/workflow";
import { WorkflowStep } from "../../propel-shared/models/workflow-step";
import { ParameterValue } from "../../propel-shared/models/parameter-value";
import { Target } from "../../propel-shared/models/target";
import { InvocationService, InvocationMessage } from "./invocation-service";
import { APIError } from "../core/api-error";
import { cfg } from "../core/config";
import { ScriptParameter } from "../../propel-shared/models/script-parameter";
import { StandardCodes } from "../core/api-error-codes";
import { ScriptValidator } from "../validators/script-validator";
import { FileSystemHelper } from "../util/file-system-helper";
import { ExecutionLog } from "../../propel-shared/models/execution-log";
import { ExecutionStep } from "../../propel-shared/models/execution-step";
import { ExecutionTarget } from "../../propel-shared/models/execution-target";
import { Utils } from "../../propel-shared/utils/utils";
import { ExecutionStatus } from "../../propel-shared/models/execution-status";
import { ExecutionError } from "../../propel-shared/models/execution-error";

/**
 * This class responsibility is everything related to run a specified workflow and 
 * log any related activities.
 */
export class Runner {

    private _cb: Function | undefined;
    private _scriptVal: ScriptValidator;
    private _localTarget: Target;
    private _execLog: ExecutionLog | undefined;

    constructor() {
        this._scriptVal = new ScriptValidator();
        this._localTarget = new Target();
        this._localTarget.FQDN = "localhost"
        this._localTarget.friendlyName = this._localTarget.FQDN;
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
    async execute(workflow: Workflow, subscriptionCallback?: Function): Promise<ExecutionLog> {
        
        let abort: boolean = false;
        this._cb = subscriptionCallback;
        this._execLog = new ExecutionLog();
        this._execLog.startedAt = new Date();
        this._execLog.workflow = workflow;

        await Utils.asyncForEach(workflow.steps, async (step: WorkflowStep) => {
            let argsList: string[] = this._buildArgumentList(step);
            let scriptCode: string = FileSystemHelper.decodeBase64(step.script.code);
            let execStep: ExecutionStep = new ExecutionStep();
            
            execStep.stepName = step.name;
            execStep.scriptName = step.script.name;
            execStep.values = step.values;
            this._execLog?.executionSteps.push(execStep);

            if (abort) {
                execStep.status = ExecutionStatus.Aborted;
            }
            else if (!step.enabled) {
                execStep.status =  ExecutionStatus.Skipped;
            }
            else {

                if (!step.script.isTargettingServers) {
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
        })

        this._execLog.status = this._summaryStatus(this._execLog.executionSteps);
        this._execLog.endedAt = new Date();
        return this._execLog;
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

                        //Subscribe to the STDOUT event listener:
                        invsvc.addSTDOUTEventListener((msg: InvocationMessage) => {
                            //TODO: ADD here info related to the script, server, etc...
                            if (this._cb) {
                                this._cb(msg);
                            }
                        })

                        //Invoke the Script:
                        et.status = ExecutionStatus.Running;
                        invsvc.invoke(this._buildCommand(scriptCode, argsList, target))
                            .then((data: any[]) => {
                                et.status = ExecutionStatus.Success;
                                et.execResults = data;
                                resolve(et);
                            })
                            .catch((err) => {
                                et.status = ExecutionStatus.Faulty
                                et.execErrors.push(new ExecutionError(err));
                                resolve(et);
                            })
                            .finally(() => {
                                pool.release(invsvc);
                            })
                    })
                    .catch((err) => {
                        //There was some issue trying to aquire an object from the pool:
                        reject(new APIError(err));
                    })
            }
        });
    }

    private _summaryStatus(execs: Array<any>): ExecutionStatus{

        let ret: ExecutionStatus = ExecutionStatus.Success;
        let skippedCount: number = 0;

        execs.forEach((item) => {

            //If there is at least one aborted item, we will summarize the status as "Aborted".
            if (item.status && item.status == ExecutionStatus.Aborted) {
                ret = ExecutionStatus.Aborted;
            }

            //If there is no Aborted items, but there is at least one Faulty, we 
            //will summarize the status as "Faulty":
            if (ret != ExecutionStatus.Aborted && item.status && item.status == ExecutionStatus.Faulty) {
                ret = ExecutionStatus.Faulty;
            }

            //If the execution was skipped for the current item, we will increase the counter:
            if (item.status && item.status == ExecutionStatus.Skipped) {
                skippedCount++;
            }
        })

        //If the item execution was successful, but all the items has been skipped, we 
        //will summarize the status as "Skipped":
        if (skippedCount && skippedCount == execs.length && ret == ExecutionStatus.Success) {
            ret = ExecutionStatus.Skipped;
        }
    
        return ret;
    }

    private _buildArgumentList(step: WorkflowStep): string[] {

        let ret: string[] = [];

        this._scriptVal.reset();

        if (step.script.parameters.length > 0) {

            step.script.parameters.forEach((param: ScriptParameter) => {
                let suppliedParam: ParameterValue | undefined = step.values.find((sp) => sp.name = param.name);
                let value: string = "$null";

                this._scriptVal.validateParameter(param, suppliedParam);

                if (suppliedParam !== undefined) {
                    value = suppliedParam.value;
                }
                else if (param.hasDefault) {
                    value = param.defaultValue;
                }

                ret.push(`(${value})`)
            })
        }

        if (!this._scriptVal.isValid) {
            throw new APIError(`We found one or more errors related to the script "${step.script.name}" parameters and the values assigned to them. Error details:
${this._scriptVal.getErrors()?.message} `, StandardCodes.WrongParameterData)
        }

        return ret;
    }

    private _buildCommand(scriptCode: string, argList: string[], target: Target): string {

        let ret: string = `$codeBlock = [Scriptblock]::Create(@'\n${scriptCode}\n'@)\nInvoke-Command`;

        /*
            Note: 
                On a development environment there is a lot of times where is not possible to
                invoke a remote computer, so when working on an environment different than prod
                we will hit the local host even when a target is defined.
         */
        if (target && cfg.isProduction) {
            //Also, need to be an script that is actually targetting a remote server:
            if (target !== this.localTarget) {
                ret += ` -ComputerName ${target.FQDN}`
            }
        }

        ret += ` -ScriptBlock $codeBlock`

        if (argList && argList.length > 0) {
            ret += ` -ArgumentList ${argList.join(" ")}`
        }

        ret += `\n` //Recall we are entering our commands via STDIN. If you don't hit enter at the end, 
        //nothing will run!!! :-)

        return ret;
    }
}