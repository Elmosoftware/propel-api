import { ExecutionLog } from "../models/execution-log";
import { ExecutionStep } from "../models/execution-step";

/**
 * All posible status values for a script invocation.
 */
export enum InvocationStatus {
    NotStarted = "NOTSTARTED",
    Preparing = "PREPARING",
    Running = "RUNNING",
    Stopping = "STOPPING",
    Stopped = "STOPPED",
    Failed = "FAILED",
    Killed = "KILLED",
    Disposed = "DISPOSED",
    Finished = "FINISHED",
    UserActionCancel = "CANCEL",
    UserActionKill = "KILL"
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

    /**
     * Message source.
     */
    public source: string;

    /**
     * Context of the execution. here the message can provide additional information related 
     * to the execution progress or any other. 
     */
    public context: ExecutionStats;

    /**
     * Execution log. This will be included only when the status is "Finished".
     */
    public log: ExecutionLog | null;

    constructor(status: InvocationStatus, message: string, source?:string, 
        context?: ExecutionStats, log?: ExecutionLog) {

        this.status = status;
        this.message = message;
        this.source = (source) ? source : "";
        this.context = (context) ? context : new ExecutionStats();
        this.log = (log) ? log : null;
        this.timestamp = new Date();
    }

    // /**
    //  * Returns a plain text version of the message that can be used for logging purposes.
    //  */
    // toString() {
    //     return `${this.timestamp.toISOString()} -> ${(this.message) ? this.message : "(" + this.status.toString() + ")"}.`
    // }
}


export class ExecutionStats {

    public currentStep: number = 0;

    public totalSteps: number = 0;

    public steps: ExecutionStep[] = [];

    public workflowName: string = "";

    public startTimestamp: Date = new Date();

    constructor() {
    }
}
