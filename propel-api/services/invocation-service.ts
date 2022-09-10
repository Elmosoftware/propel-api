//@ts-ignore
import * as NodePowershell from "elmosoftware-node-powershell";
import { EventEmitter } from "events";

import { WebsocketMessage, InvocationStatus } from "../../propel-shared/core/websocket-message";
import { Disposable, Resettable } from "../core/object-pool";
import { Utils } from "../../propel-shared/utils/utils";
import { SystemHelper } from "../util/system-helper";
import { logger } from "../services/logger-service";
import { PropelError } from "../../propel-shared/core/propel-error";

/**
 * This service allows to execute a PowerShell command or script. Subscribe to events from the process 
 * standard output, so you can monitor the execution in realtime, and access to the script execution 
 * results in JSON format.
 * @implements Disposable
 */
export class InvocationService implements Disposable, Resettable {

    private _shell: NodePowershell.default;
    private _eventEmitter!: EventEmitter;
    private _STDOUTs!: string[];
    private _invocationStatus!: InvocationStatus;
    private _isDisposed: boolean = false;
    private _EOIrexp: RegExp;

    constructor() {
        this._EOIrexp = new RegExp("EOI_([A-Za-z0-9_-]){7,14}$", "gi");

        this._shell = new NodePowershell.default({
            executionPolicy: 'Bypass',
            noProfile: true,
            verbose: false
        })

        this.reset();
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
        this._eventEmitter.addListener("data", (invocationMessage: WebsocketMessage<any>) => cb(invocationMessage));
    }

    /**
     * Executes a powershell command or script and return the results.
     * @param command Command to execute. It can be a commandlet, script block or a full path to a script.
     * @param params Optional execution arguments.
     */
    invoke(command: string, params?: any[]): Promise<string> {

        this._emit(InvocationStatus.Preparing);

        return new Promise<string>((resolve, reject) => {
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
            this.addSTDOUTEventListener((invMsg: WebsocketMessage<any>) => {
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

                let isFragment: boolean = false;
                let isFragmentEnd: boolean = false;
                let fragmentSize: number = 0;
                let isEOI: boolean = this._isEOI(chunk);
                let debugInfo: string = ""

                if (!chunk) {
                    return;
                }

                debugInfo += `NEW CHUNK: ${(chunk.length >= 60) ? chunk.substring(0, 25) + "..." + chunk.substring(chunk.length -25, chunk.length) : chunk }
CHUNK DETAILS: Size:${chunk.length}, 2 End chars:${chunk.charCodeAt(chunk.length - 2)};${chunk.charCodeAt(chunk.length - 1)}`;

                if (this._STDOUTs && this._STDOUTs.length > 0) {
                    let prev = this._STDOUTs[this._STDOUTs.length - 1];
                    //If the previous chunk doesn't ends with a breakline, means this chunk is the continuation: 
                    isFragment = !this._endsWithBreakline(prev);

                    /*
                        NOTE: 
                            As you can see in this still opened bug: https://github.com/rannn505/node-powershell/issues/94
                            there is some times were the EOI, (End of invocation), signal is sent with the 
                            data. This is causing the following issue:
                                The EOI signal will be added to the data and if we are returning JSON, any
                            parsing is going to fail.

                            Remediation: We need to detect the cases and remove the EOI signal from the data.
                    */
                    //node-powershell is using the shortid package to generate the EOI identifier. The ids 
                    //generated can have from 7 to 14 chars. We also have the "EOI_" prefix.
                    //So if the chunk contains the EOI and the total chunk lenght is greater than 18 chars
                    //then we found the cases mentioned in the bug:
                    if (isEOI && chunk.length > 18) {
                        chunk = this._removeEOI(chunk);
                    }

                    isFragmentEnd = isFragment && this._endsWithBreakline(chunk);
                }

                logger.logDebug(`${debugInfo}, EOI: ${isEOI}, Is continuation: ${isFragment}, Is end packet: ${isFragmentEnd}.`) //, EOI removed: ${this._mustDispose}.`)

                if (isFragment) {
                    this._STDOUTs[this._STDOUTs.length - 1] += chunk;
                    fragmentSize = this._STDOUTs[this._STDOUTs.length - 1].length;
                }
                else if(!isEOI) {
                    this._STDOUTs.push(chunk);
                }

                if(isFragment && !isFragmentEnd) {
                    this._emit(InvocationStatus.Running, `Receiving data ... (${(fragmentSize/1024).toFixed(1)}KB)`);
                }
                else {
                    this._emit(InvocationStatus.Running, this._STDOUTs[this._STDOUTs.length - 1]);
                }

                if (isEOI) {
                    this._emit(InvocationStatus.Stopping);
                }
            });

            //Invoking the command:
            this._shell.invoke()
                .then((out: string) => {
                    this._emit(InvocationStatus.Stopped);
                    logger.logDebug(`RESOLVING Invocation.`)
                    resolve(this.getLastReceivedChunk())
                })
                .catch((err: any) => {
                    this._emit(InvocationStatus.Failed, String(err));
                    logger.logDebug(`REJECTING Invocation.`)
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

    private getLastReceivedChunk(): string {
        let ret: string = "";

        if (this._STDOUTs.length > 0) {
            ret = this._STDOUTs[this._STDOUTs.length - 1];
        }

        return ret;
    }

    private _endsWithBreakline(text: string): boolean {
        let ret: boolean = false;

        if (!text) return ret;

        ret = (text.charCodeAt(text.length - 1) == 13 || text.charCodeAt(text.length - 2) == 13);

        return ret;
    }

    private _isEOI(text: string): boolean {
        let ret = this._EOIrexp.exec(text);
        return Boolean(ret && ret.length > 0);
    }

    private _removeEOI(text: string): string {
        return text.replace(this._EOIrexp, "");
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

        if (message) {
            message = Utils.removeANSIEscapeCodes(message);
        }

        this._eventEmitter.emit("data", new WebsocketMessage(status, (message) ? message : ""));
    }
}