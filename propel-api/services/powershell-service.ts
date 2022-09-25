import { PowerShell, InvocationResult } from "node-powershell";
import { EventEmitter } from "events";

import { WebsocketMessage, InvocationStatus } from "../../propel-shared/core/websocket-message";
import { Disposable, Resettable } from "../core/object-pool";
import { Utils } from "../../propel-shared/utils/utils";
import { logger } from "../services/logger-service";
import { PropelError } from "../../propel-shared/core/propel-error";

/**
 * This service allows to execute a PowerShell command or script. Subscribe to events from the process 
 * standard output, so you can monitor the execution in realtime, and access to the script execution 
 * results in JSON format.
 * @implements Disposable
 */
export class PowerShellService implements Disposable, Resettable {

    private _shell: PowerShell;
    private _eventEmitter!: EventEmitter;
    private _STDOUTs!: string[];
    private _invocationStatus!: InvocationStatus;
    private _isDisposed: boolean = false;

    constructor() {
        this._shell = new PowerShell({
            debug: false,
            executableOptions: {
                '-ExecutionPolicy': 'Bypass',
                '-NoProfile': true,
                '-Verbose': false
            }
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
    invoke(command: string): Promise<string> {

        this._emit(InvocationStatus.Preparing);

        return new Promise<string>((resolve, reject) => {

            this._emit(InvocationStatus.Running)

            //We need to listen to the events here in order to reject if the execution is cancelled 
            //and forced to stop immediately by killing the PS process:
            this.addSTDOUTEventListener((invMsg: WebsocketMessage<any>) => {
                if (invMsg.status == InvocationStatus.Disposed) {
                    reject(new PropelError(invMsg.message));
                }
            })

            //If the STDOUT has any listeners from previous runs, we will dettach them:
            if (this._shell.streams.stdout.listenerCount("data") > 0) {
                this._shell.streams.stdout.removeAllListeners("data");
            };

            //Listening on the PS process standard output:
            this._shell.streams.stdout.on("data", (chunk: string) => {

                let isFragment: boolean = false;
                let isFragmentEnd: boolean = false;
                let fragmentSize: number = 0;
                let debugInfo: string = ""

                if (!chunk || this._isBulkDelimiter(chunk)) return;

                debugInfo += `STDOUT received: \r\n${(chunk.length >= 80) ? chunk.substring(0, 35)
                    + " .... " + chunk.substring(chunk.length - 35, chunk.length) : chunk}
Details: Size=${chunk.length}, Last two chars=${chunk.charCodeAt(chunk.length - 2)};${chunk.charCodeAt(chunk.length - 1)}`;

                if (this._STDOUTs && this._STDOUTs.length > 0) {
                    let prev = this._STDOUTs[this._STDOUTs.length - 1];
                    //If the previous chunk doesn't ends with a breakline, means this chunk is the continuation: 
                    isFragment = !this._endsWithBreakline(prev);
                    isFragmentEnd = isFragment && this._endsWithBreakline(chunk);
                }

                logger.logDebug(`${debugInfo}, Is a fragment=${isFragment}${(isFragment) ? ", Is final fragment=" + String(isFragmentEnd) + "." : "."}`)

                if (isFragment) {
                    this._STDOUTs[this._STDOUTs.length - 1] += chunk;
                    fragmentSize = this._STDOUTs[this._STDOUTs.length - 1].length;
                }
                else {
                    this._STDOUTs.push(chunk);
                }

                if (isFragment && !isFragmentEnd) {
                    this._emit(InvocationStatus.Running, `Receiving data ... (${(fragmentSize / 1024).toFixed(1)}KB)`);
                }
                else {
                    this._emit(InvocationStatus.Running, this._STDOUTs[this._STDOUTs.length - 1]);
                }
            });

            //Invoking the command:
            this._shell.invoke(command)
                .then((result: InvocationResult) => {
                    this._emit(InvocationStatus.Stopped);
                    logger.logDebug(`PowerShellService invocation is done. Total payload: ${result.raw?.length}b, Elapsed time: ${result.duration}ms.`)
                    resolve(this._getLastReceivedChunk())
                })
                .catch((err: any) => {
                    this._emit(InvocationStatus.Failed, String(err));
                    reject(err);
                });
        });
    }

    dispose(): Promise<void> {
        let msg: string = "PowerShell instance is disposed. This could be caused by user interruption."
        this._isDisposed = true;
        logger.logInfo(msg)
        this._emit(InvocationStatus.Disposed, msg);
        this.reset();
        return this._shell.dispose();
    }

    disposeAnForget() {
        this.dispose()
            .catch((error) => {
                logger.logWarn(`Powershell service disposing process ended with error. Following details: ${String(error)}`)
            });
    }

    reset() {
        if (this._eventEmitter) {
            this._eventEmitter.removeAllListeners("data");
        }

        this._STDOUTs = [];
        this._eventEmitter = new EventEmitter();
        this._invocationStatus = InvocationStatus.NotStarted
    }

    private _getLastReceivedChunk(): string {
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

    private _isBulkDelimiter(chunk: string): boolean {
        return new RegExp("^[a-z0-9]{16}\r\n$", "gi")
            .test(chunk);
    }

    private _emit(status: InvocationStatus, message?: string) {
        this._invocationStatus = status;

        if (message) {
            message = Utils.removeANSIEscapeCodes(message);
        }

        this._eventEmitter.emit("data", new WebsocketMessage(status, (message) ? message : ""));
    }
}