import NodePowershell from "node-powershell";
import { EventEmitter } from "events";

import { InvocationMessage, InvocationStatus } from "../../propel-shared/core/invocation-message";
import { Disposable, Resettable } from "../core/object-pool";
import { Utils } from "../../propel-shared/utils/utils";
import { SystemHelper } from "../util/system-helper";
import { logger } from "../../propel-shared/services/logger-service";
import { PropelError } from "../../propel-shared/core/propel-error";

/**
 * This service allows to execute a PowerShell command or script. Subscribe to events from the process 
 * standard output, so you can monitor the execution in realtime, and access to the script execution 
 * results in JSON format.
 * @implements Disposable
 */
export class InvocationService implements Disposable, Resettable {

    private _shell: NodePowershell;
    private _eventEmitter!: EventEmitter;
    private _STDOUTs!: string[];
    private _invocationStatus!: InvocationStatus;
    private _isDisposed: boolean = false;

    constructor() {
        this._shell = new NodePowershell({
            executionPolicy: 'Bypass',
            noProfile: true,
            verbose: false
        })

        this.reset();
    }

    /**
     * Returns the results, (last output), from the script execution.
     */
    get results(): any[] {

        let ret: any[] = [];

        if (this._STDOUTs.length > 0) {
            let last = this._STDOUTs[this._STDOUTs.length - 1];

            if (Utils.isValidJSON(last)) {
                ret = JSON.parse(last);

                if (!Array.isArray(ret)) {
                    ret = [ret];
                }
            }
            else {
                ret.push(last);
            }
        }

        return ret;
    }

    /**
     * Invocation service current status.
     */
    get status(): InvocationStatus {
        return this._invocationStatus;
    }

    /**
     * Implementation of Disposable.isDisposed attribute.
     */
    get isDisposed(): boolean {
        return this._isDisposed;
    }

    /**
     * Subscribe to the STDOUT messages and state changes.
     * @param cb Callback function.
     */
    addSTDOUTEventListener(cb: Function) {
        this._eventEmitter.addListener("data", (invocationMessage: InvocationMessage) => cb(invocationMessage));
    }

    /**
     * Executes a powershell command or script and return the results.
     * @param command Command to execute. It can be a commandlet, script block or a full path to a script.
     * @param params Optional execution arguments.
     */
    invoke(command: string, params?: any[]): Promise<any> {

        this._emit(InvocationStatus.Preparing);

        return new Promise<any[]>((resolve, reject) => {
            this._shell.addCommand(command);

            if (params && Array.isArray(params) && params.length > 0) {
                //The following method is well documented in node-powershell library, but is not included 
                //in @types/node-powershell *.d.ts file the types, so we need to ignore the warning.
                //@ts-ignore
                this._shell.addParameters(params);
            }

            this._emit(InvocationStatus.Running)

            //We need to listen to the events here in order to reject if the execution is cancelled 
            //and forced to stop immediately by killing the PS process:
            this.addSTDOUTEventListener((invMsg: InvocationMessage) => {
                if (invMsg.status == InvocationStatus.Killed) {
                    reject(new PropelError(invMsg.message));
                }
            })

            //If the STDOUT has any listeners form previous runs, we will dettach them:
            if (this._shell.streams.stdout.listenerCount("data") > 0) {
                this._shell.streams.stdout.removeAllListeners("data");
            };

            //Listening on the PS process standard output:
            this._shell.streams.stdout.on("data", (chunk: string) => {

                chunk = Utils.removeEmptyLines(chunk, true);

                if (!chunk) {
                    return;
                }

                //We will emit at least the event indicates the end of the invocation:
                if (chunk.startsWith("EOI_")) {
                    this._emit(InvocationStatus.Stopping);
                }
                else {
                    this._STDOUTs.push(chunk);
                    this._emit(InvocationStatus.Running, chunk);
                }
            });

            //Invoking the command:
            this._shell.invoke()
                .then((out: string) => {
                    this._emit(InvocationStatus.Stopped);
                    resolve(this.results)
                })
                .catch((err) => {
                    this._emit(InvocationStatus.Failed, String(err));
                    reject(err);
                });
        });
    }

    disposeSync() {
        this._dispose()
            .then((msg) => {
                logger.logInfo(`InvocationService dispose message: "${String(msg)}".`)
            })
            .catch((err) => {
                logger.logWarn(`InvocationService disposing error. Following details: ${String(err)}`)
            });
    }

    dispose() {
        return this._dispose();
    }

    reset() {
        if (this._eventEmitter) {
            this._eventEmitter.removeAllListeners("data");
        }

        this._STDOUTs = [];
        this._eventEmitter = new EventEmitter();
        this._invocationStatus = InvocationStatus.NotStarted

        //The following method is well documented in node-powershell library, but is not included 
        //in @types/node-powershell *.d.ts file the types, so we need to ignore the warning.
        //@ts-ignore
        this._shell.clear();
    }

    private _dispose(): Promise<string> {
        let ret: Promise<string>;
        let msg: string = "InvocationService instance is disposing."
        let status: InvocationStatus = InvocationStatus.Disposed;
        this._isDisposed = true;

        //If the dispose method is called during an invocation, we are going to force the PowerShell
        //process to finish:
        //@ts-ignore
        if (this._shell.invocationStateInfo == "Running") {
            //The following property is well documented in node-powershell library, but is not included 
            //in @types/node-powershell *.d.ts file, so we need to ignore the warning.
            //@ts-ignore
            msg += `The user is requesting to force the stop of a running command. Trying to kill PowerShell process with id #${this._shell.pid}.`
            //@ts-ignore
            ret = SystemHelper.killProcess(this._shell.pid);
            logger.logInfo(msg)
            status = InvocationStatus.Killed;
        }
        else {
            //Otherwise, we will exit gracefully:
            ret = this._shell.dispose();
        }
        this._emit(status, msg);
        this.reset();
        return ret;
    }

    private _emit(status: InvocationStatus, message?: string) {
        this._invocationStatus = status;
        this._eventEmitter.emit("data", new InvocationMessage(status, (message) ? message : ""));
    }
}