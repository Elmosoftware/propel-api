import NodePowershell from "node-powershell";
import { EventEmitter } from "events";

import { Disposable, Resettable } from "../core/object-pool";
import { Utils } from "../util/utils";
import { logger } from "../services/logger-service";

/**
 * All posible status values for a script invocation.
 */
export enum InvocationStatus {
    Preparing = "PREPARING",
    Running = "RUNNING",
    Stopping = "STOPPING",
    Stopped = "STOPPED",
    Failed = "FAILED"
}

/**
 * A message returned during a script execution containing status data as also whatever 
 * the script returns from his standard output.
 */
export class InvocationMessage {

    /**
     * Current invocation status.
     */
    public readonly status: InvocationStatus;

    /**
     * Message returned from the script execution process standard output.
     */
    public readonly message: string;

    /**
     * Message or Status change timestamp.
     */
    public readonly timestamp: Date;

    constructor(status: InvocationStatus, message: string) {
        this.status = status;
        this.message = message;
        this.timestamp = new Date();
    }

    /**
     * Returns a plain text version of the message that can be used for logging purposes.
     */
    toString() {
        return `${this.timestamp.toISOString()} -> ${(this.message) ? this.message : "(" + this.status.toString() + ")"}.`
    }
}

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
            this._shell.invoke()
                .then((out: string) => {
                    this._emit(InvocationStatus.Stopped);
                    resolve(this.results)
                })
                .catch((err) => {
                    this._emit(InvocationStatus.Failed, String(err));
                    reject(err);
                });

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
        });
    }

    disposeSync() {
        this._dispose()
            .then(() => {})
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

        //The following method is well documented in node-powershell library, but is not included 
        //in @types/node-powershell *.d.ts file the types, so we need to ignore the warning.
        //@ts-ignore
        this._shell.clear();
    }

    private _dispose(): Promise<string> {
        this.reset();
        return this._shell.dispose();
    }

    private _emit(status: InvocationStatus, message?: string) {
        this._eventEmitter.emit("data", new InvocationMessage(status, (message) ? message : ""));
    }
}