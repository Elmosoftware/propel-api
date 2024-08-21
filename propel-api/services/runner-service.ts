import { pool } from "../services/powershell-service-pool";
import { Workflow } from "../../propel-shared/models/workflow";
import { WorkflowStep } from "../../propel-shared/models/workflow-step";
import { ParameterValue } from "../../propel-shared/models/parameter-value";
import { Target } from "../../propel-shared/models/target";
import { PowerShellService } from "./powershell-service";
import { WebsocketMessage, InvocationStatus, ExecutionStats } from "../../propel-shared/core/websocket-message";
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
import { CredentialCache } from "../services/credential-cache";
import { logger } from "./logger-service";
import { SecurityToken } from "../../propel-shared/core/security-token";
import { UserAccount } from "../../propel-shared/models/user-account";
import { TypeConverter } from "../../propel-shared/core/type-converter";
import { JSType, PowerShellLiterals } from "../../propel-shared/core/type-definitions";
import { QueryModifier } from "../../propel-shared/core/query-modifier";
import { PagedResponse } from "../../propel-shared/core/paged-response";
import { RunnerServiceData } from "../../propel-shared/core/runner-service-data";

/**
 * This class responsibility is everything related to run a specified workflow and 
 * log any related activities.
 */
export class Runner {

    private _cb: Function | undefined;
    private _scriptVal: ScriptValidator;
    private _localTarget: Target;
    private _execLog: ExecutionLog | undefined;
    private _cancelledExecution: boolean;
    private _abortedExecution: boolean;
    private _currentInvocations: PowerShellService[];
    private _stats!: ExecutionStats;
    private _credentialCache: CredentialCache;
    private _serviceData: RunnerServiceData

    constructor() {
        this._scriptVal = new ScriptValidator();
        this._localTarget = new Target();
        this._localTarget.FQDN = "localhost"
        this._localTarget.friendlyName = this._localTarget.FQDN;
        this._cancelledExecution = false;
        this._abortedExecution = false;
        this._currentInvocations = [];
        this._credentialCache = new CredentialCache();
        this._serviceData = new RunnerServiceData()
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

    get currentStats(): ExecutionStats {
        if (this._stats) return this._stats
        else return new ExecutionStats()
    }

   /**
    * This method takes care of the script execution and returns a promised _"ExecutionLog"_ with all 
    * the execution details.
    * @param data RunnerServiceDate instance that include the Workflow to run plus 
    * any runtime parameters vaklues if needed.
    * @param token Security token. 
    * @param subscriptionCallback Message callback
    * @returns The execution stats
    */
    async execute(data: RunnerServiceData, token: SecurityToken, subscriptionCallback?: Function): Promise<WebsocketMessage<ExecutionStats>> {

        let abort: boolean = false;
        this._cb = subscriptionCallback;
        this._cancelledExecution = false;
        this._abortedExecution = false;
        let workflow: Workflow | undefined

        //Creating stats:
        this._stats = new ExecutionStats();
        this._stats.isRunning = true;

        //Creating execution log:
        this._execLog = new ExecutionLog();
        this._execLog.startedAt = new Date();
        this._execLog.user = DataService.asObjectIdOf<UserAccount>(token?.userId);//To avoid grabbing 
        //the full UserAccount object.
        this._execLog.runOnSchedule = data.runOnSchedule;

        //Checking service data validity:
        logger.logDebug(`Validating service data...`);
        try {
            this._serviceData.hydrate(data);
        } catch (error) {
            return Promise.reject(error)
        }

        logger.logDebug(`Preparing for execution...`);
        workflow = await this.getWorkflow(this._serviceData.workflowId, token);

        //If the Workflow is missing/deleted, we are not able to proceed.
        if (!workflow) {
            this._execLog.execError = new ExecutionError(
                new PropelError("The workflow does not exists. Please verify if it was deleted before retrying."));
            this._execLog.status = ExecutionStatus.Faulty;

            return this.persistLogAndReturnStats(this._execLog, this._stats, token);
        }
        else {
            this._execLog.workflow = DataService.asObjectIdOf<Workflow>(workflow._id);
        }      

        logger.logInfo(`Starting execution of Workflow "${workflow.name}" with id: "${workflow._id}".`)

        logger.logDebug(`Merging the provided runtime parameters in the Workflow.\r\n Values provided:
${JSON.stringify(this._serviceData)}`);
        
        try {
            this._mergeRuntimeParameters(workflow, this._serviceData)
        } catch (error) {
            let e = new PropelError(error as Error)

            this._execLog.execError = new ExecutionError(
                new PropelError(`There was an error checking the runtime parameters.\r\n` +
                    `This error could be related to some of the values set by the user just before to run ` +
                    `the Workflow. Please verify the details before to retry. Following the error details: ` + 
                    e.message));
            this._execLog.status = ExecutionStatus.Faulty;

            return this.persistLogAndReturnStats(this._execLog, this._stats, token);
        }

        try {
            await this._credentialCache.build(workflow, token)
         } catch (error) {
            let e = new PropelError(error as Error)

            this._execLog.execError = new ExecutionError(
                new PropelError(`There was an error during the preparation.\r\n` + 
                    `This error is related to the credentials assigned to one specific target or the ` + 
                    `credentials set to one or more Propel parameters in any of the scripts, please verify them ` +
                    `before to retry. Following the error details: ` + e.message));
            this._execLog.status = ExecutionStatus.Faulty;

            return this.persistLogAndReturnStats(this._execLog, this._stats, token);
        }

        this._stats.workflowName = workflow.name;
        this._stats.totalSteps = workflow.steps.length;
        this._stats.steps = workflow.steps.map((step) => {
            let ret = new ExecutionStep();

            ret.stepName = step.name;
            ret.status = ExecutionStatus.Pending;

            return ret;
        });

        logger.logDebug(`Pool stats before to start workflow execution:\n${pool.stats.toString()}`)

        await Utils.asyncForEach(workflow.steps, async (step: WorkflowStep, i: number) => {
            let argsList: string[] = [];
            let scriptCode: string = "";
            let execStep: ExecutionStep = new ExecutionStep();

            logger.logInfo(`Starting execution of step "${step.name}"`);

            //Updating Execution log:
            execStep.stepName = step.name;
            execStep.scriptName = step.script.name;
            execStep.scriptEnabled = step.script.enabled;
            execStep.values = step.values;
            this._execLog?.executionSteps.push(execStep);

            //Updating stats:
            this._stats.currentStep = i + 1;
            this._stats.steps[i].status = ExecutionStatus.Running;

            try {
                argsList = this._buildArgumentList(step);
                scriptCode = this._preprocessScriptCode(step.script.code);
            } catch (error) {
                execStep.status = ExecutionStatus.Faulty;
                execStep.execError = new ExecutionError((error as Error));
            }

            if (this._cancelledExecution) {
                abort = true //Next steps,(if any), will be aborted.
                execStep.status = ExecutionStatus.CancelledByUser;
            }
            else if (abort) {
                execStep.status = ExecutionStatus.Aborted;
            }
            else if (!step.enabled || !execStep.scriptEnabled) {
                execStep.status = ExecutionStatus.Skipped;
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
                    //We must do this check before to start executing, because some previous issues with the 
                    //arguments or script decoding can prevent the execution:
                    if (execStep.status == ExecutionStatus.Pending) {
                        execStep.startedAt = new Date();
                        logger.logInfo(`Executing script "${step.script.name}" on "${step.targets.map((t) => t.FQDN).join(", ")}"`)
                        this._logInvocationArgs(argsList, this._credentialCache.allSecretStrings);
                        execStep.targets = await this._executeOnAllTargets(scriptCode, argsList, step.targets);
                        execStep.status = this._summaryStatus(execStep.targets);
                    }
                } catch (error) {
                    execStep.status = ExecutionStatus.Faulty;
                    execStep.execError = new ExecutionError((error as Error));
                }
                finally {
                    execStep.endedAt = new Date();
                }

                //If the step has errors and the workflow is configured to abort in that situation:
                if (execStep.status == ExecutionStatus.Faulty && step.abortOnError) {
                    abort = true;
                }
            }

            this._stats.steps[i].status = execStep.status;
        })

        this._execLog.status = this._summaryStatus(this._execLog.executionSteps);
        logger.logDebug(`Pool stats at the end of workflow execution:\n${pool.stats.toString()}`);

        return this.persistLogAndReturnStats(this._execLog, this._stats, token);
    }

    async persistLogAndReturnStats(execLog: ExecutionLog, stats: ExecutionStats, token: SecurityToken): Promise<WebsocketMessage<ExecutionStats>> {
        let resultsMessage: WebsocketMessage<ExecutionStats>;

        try {
            stats.logStatus = execLog.status;
            stats.isRunning = false;
            execLog.endedAt = new Date();
            execLog._id = await this.saveExecutionLog(this._prepareLogForSave(execLog), token);
            stats.logId = execLog._id;
            resultsMessage = new WebsocketMessage(InvocationStatus.Finished, "", stats);
        } catch (error) {
            let e = new PropelError((error as Error), ErrorCodes.saveLogFailed);
            logger.logError(e);
            stats.logStatus = ExecutionStatus.Faulty
            resultsMessage = new WebsocketMessage(InvocationStatus.Failed,
                e.errorCode.userMessage, this._stats);
        }

        return resultsMessage;
    }

    /**
     * Persist an entire execution log in the database.
     * @param log Log to persist.
     * @returns A promise with the operation results.
     */
    async saveExecutionLog(log: ExecutionLog, token: SecurityToken): Promise<string> {
        let svc: DataService = db.getService("ExecutionLog", token);
        return svc.add(log);
    }

    async getWorkflow(id: string, token: SecurityToken): Promise<Workflow | undefined> {
        let svc: DataService = db.getService("workflow", token);
        let result: PagedResponse<Workflow>;
        let qm = new QueryModifier();

        qm.filterBy = { _id: id };

        try {
            result = await svc.find(qm) as PagedResponse<Workflow>;
        } catch (error) {
            return Promise.reject(error)
        }

        return Promise.resolve(result.data[0]);
    }

    /**
     * Calling this method will cancel the workflow execution.
     * @param kill If this parameter is true, the execution will be stopped 
     * immediately by killing the execution process.
     * if this paramter is false, the execution will be cancelled as soon the current step is done 
     * by preventing next steps to start. 
     */
    cancelExecution(kill: boolean = false): void {
        let msg: string = `A request to cancel the execution has arrived. Execution will be stopped `;
        this._cancelledExecution = true;

        if (kill && this._currentInvocations.length > 0) {
            this._abortedExecution = true;
            logger.logInfo(msg + `immediately.`)
            this._currentInvocations.forEach((inv: PowerShellService) => {
                if (inv.status == InvocationStatus.Running) {
                    inv.disposeAnForget();
                }
            })
        }
        else {
            logger.logInfo(msg + `before to run next step.`)
        }
    }

    /**
     * Allows to send a message to the client.
     * @param msg Message to send.
     */
    sendMessage(msg: WebsocketMessage<ExecutionStats>) {
        if (this._cb) {
            msg.context = this._stats;
            this._cb(msg);
        }
    }

    private _mergeRuntimeParameters(workflow: Workflow, data: RunnerServiceData) {

        workflow.steps.map((step: WorkflowStep, stepIndex: number) => {
            step.values
            .filter((pv: ParameterValue) => pv.isRuntimeParameter)
            .map((pv: ParameterValue) => {
                let rp: ParameterValue | undefined = data.getParameter(stepIndex, pv.name)

                if(!rp) throw new PropelError(`There was an error merging the Workflow runtime parameters. 
No value was supplied for the runtime parameter "${pv.name}" of the step "${step.name}".`);
                
                pv.value = rp.value
            })
        })
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
                    .then((invsvc: PowerShellService) => {
                        this._addToCurrentInvocations(invsvc);

                        //Subscribe to the STDOUT event listener:
                        invsvc.addSTDOUTEventListener((msg: WebsocketMessage<ExecutionStats>) => {
                            msg.source = target.friendlyName;
                            this.sendMessage(msg);
                        })

                        //Invoke the Script:
                        et.status = ExecutionStatus.Running;
                        et.startedAt = new Date();
                        invsvc.invoke(this._buildCommand(scriptCode, argsList, target))
                            .then((data: string) => {
                                let JSONData = SystemHelper.detectJSON(data);
                                et.status = (this._abortedExecution) ? ExecutionStatus.CancelledByUser : ExecutionStatus.Success;
                                et.execResults = (JSONData) ? JSONData : data;
                                this._removeFromCurrentInvocations(invsvc)
                                logger.logInfo(`Command invocation in ${target.FQDN} is finished successfully.`)
                                resolve(et);
                            })
                            .catch((err) => {
                                et.status = ExecutionStatus.Faulty
                                et.execErrors.push(new ExecutionError(this.formatError(err)));
                                this._removeFromCurrentInvocations(invsvc);
                                logger.logInfo(`Command invocation in ${target.FQDN} is finished with error.`)
                                resolve(et);
                            })
                            .finally(() => {
                                et.endedAt = new Date();
                                this._removeFromCurrentInvocations(invsvc);
                                pool.release(invsvc);
                            })
                    })
                    .catch((err) => {
                        //There was some issue trying to aquire an object from the pool:
                        reject(new PropelError(err));
                    })
            }
        });
    }

    private _addToCurrentInvocations(inv: PowerShellService): void {
        this._currentInvocations.push(inv);
    }

    private _removeFromCurrentInvocations(inv: PowerShellService): void {
        let pos: number = -1;

        this._currentInvocations.forEach((currentInv: PowerShellService, i: number) => {
            if(currentInv === inv) pos = i;
        })

        if (pos != -1) {
            this._currentInvocations.splice(pos, 1);
        }
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

    private _summaryStatus(execs: Array<any>): ExecutionStatus {

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

        //If the script has parameters, we check the validity of the supplied values:
        if (step.script.parameters.length > 0) {

            step.script.parameters.forEach((param: ScriptParameter) => {
                let suppliedParam: ParameterValue | undefined = step.values.find((sp) => sp.name == param.name);
                let type = TypeConverter.getConvertibleJSType(param.nativeType)
                let value: string | string[] = type.emptyOrNull;
                let prefix: string = "";
                let sufix: string = "";
                let includeInList: boolean = true;

                if (suppliedParam !== undefined) {
                    value = suppliedParam.value;
                }
                else if (param.hasDefault) {
                    value = param.defaultValue;
                }

                if (param.isPropelParameter) {
                    value = this._buildPropelVariableValue(value);
                }

                //If the parameter is not required, has no default value and also
                //it can be null or empty and no value was assigned to it, we don't need
                //to include it in the list or arguments:
                if (!param.required && !param.hasDefault &&
                    (param.canBeNull || param.canBeEmpty) && 
                    value == type.emptyOrNull) {
                    includeInList = false;
                }
                else {
                    // If is going to be included in the parameters list, we must validate is ok:
                    this._scriptVal.validateParameter(param, suppliedParam);
                }

                if (value !== type.emptyOrNull && type.type == JSType.String) {
                    prefix = `"`;
                    sufix = `"`;
                }

                if(includeInList){
                    ret.push(`-${param.name}:${prefix}${value}${sufix}`)
                } 
            })
        }

        if (!this._scriptVal.isValid) {
            throw new PropelError(`We found one or more errors related to the script "${step.script.name}" parameters and the values assigned to them. Error details:
${this._scriptVal.getErrors()?.message} `, ErrorCodes.WrongParameterData)
        }

        return ret;
    }

    private _buildCommand(scriptCode: string, argList: string[], target: Target): string {

        let ret: string = 
        `$codeBlock = [Scriptblock]::Create(@'\r\n&{\r\n${scriptCode}\r\n} ${argList.join(" ")}\r\n'@)\r\nInvoke-Command`;

        /*
            Note: 
                On a development environment there is a lot of times where is not possible to
                invoke a remote computer, (because of security restrictions), so when working on an 
                environment different than prod we will hit our local machine even when a target is defined.
         */
        if (cfg.isProduction) {
            ret += ` -ComputerName ${target.FQDN}`

            if (target.invokeAs) {
                let cacheItem = this._credentialCache.getById(target.invokeAs._id.toString());

                if (!cacheItem) {
                    throw new PropelError(`Error building the command. Credential with name "${target.invokeAs.name}" was not found in cache.`)
                }

                ret += ` -Credential (${Utils.getPSCredentialFromSecret(cacheItem.secret)})`;
            }
        }

        ret += ` -ScriptBlock $codeBlock`
        ret += `\r\n` //Recall: we are entering our commands via STDIN. If you don't hit enter at the end, 
        //nothing will run!!! :-)

        return ret;
    }

    /**
     * Build the value for all the Credentials specified in one Propel parameter.
     * The rsult is a serialized PowerShell array including the data for all the specified credentials.
     * @param credentialIds Ids of the credentials to be passed as value in the Propel Parameter.
     * @returns A serialized Powershell array with all the credentials data.
     */
    private _buildPropelVariableValue(credentialIds: any): string {
        let ret: string = ""

        if(!credentialIds || String(credentialIds) == PowerShellLiterals.$null) return String(credentialIds) 

        if (!Array.isArray(credentialIds)) {
            credentialIds = credentialIds
                .split(",")
                .map((v: any) => String(v).trim())
        }

        credentialIds.forEach((id: string, i: number) => {
            let cacheItem = this._credentialCache.getById(id);

            if (!cacheItem) {
                throw new PropelError(`Error building Propel variable value. Credential with identifier "${id}" was not found in cache.`)
            }

            ret += ((i > 0)? ", " : "") +
                Utils.credentialToPowerShellCustomObject(cacheItem.credential, cacheItem.secret);            
        });

        return "@(" + ret + ")"
    }

    /**
     * This method log the list of parameters used for the script invocation.
     * The parameter "secrets" is a list of sensitive data that we would like to prevent 
     * been in the logs, (like passwords, usernames, etc.)
     * @param command command to log.
     * @param secrets list of keywords to scrub.
     */
    private _logInvocationArgs(argumentList: string[], secrets: string[]) {

        let list: string = "";

        argumentList.forEach((item) => {
            if (secrets && secrets.length > 0) {
                secrets.forEach((secret) =>{
                    item = item.replace(new RegExp(SystemHelper.RegExpEscape(secret), "g"), "********")            
                })
            }
            list += `  ${item}\r\n`
        })
        
        if (!list) {
            logger.logDebug(`The script has no arguments set.`);
        }
        else {
            logger.logDebug(`Executing script with the following arguments:\r\n${list}`);
        }
    }

    private _prepareLogForSave(log: ExecutionLog): ExecutionLog {
        let maxLogSize: number = cfg.maxWorkflowResultsSize;
        let originalSize: number = 0;
        let removedCount: number = 0;

        log.executionSteps.forEach((s: ExecutionStep) => {
            s.targets.forEach((t: ExecutionTarget) => {
                originalSize += t.execResults.length;

                if (originalSize > maxLogSize) {
                    t.execResults = `Removing the results because they exceeded the execution log quota.\r\nMaximum allowed results size: ${cfg.maxWorkflowResultsSizeInMB.toFixed(2)}MB.`;
                    removedCount++;
                }
            })
        })

        if (originalSize > maxLogSize) {
            logger.logInfo(`${removedCount} of all the target execution results has been removed from the execution log because they were exceeding the execution log quota. 
Total size of target(s) execution results is: ${originalSize} Bytes (${(originalSize / 1024 / 1024).toFixed(2)}MB)
Maximum allowed size is: ${cfg.maxWorkflowResultsSize} Bytes (${cfg.maxWorkflowResultsSizeInMB.toFixed(2)}MB).`);
        }

        return log;
    }
}
