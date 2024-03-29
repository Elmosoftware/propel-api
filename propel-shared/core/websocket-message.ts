import { ExecutionStep } from "../models/execution-step";

/**
 * All posible status values for a script invocation.
 */
export enum InvocationStatus {
    NotStarted = "NOTSTARTED",
    Editing = "EDITING",
    Preparing = "PREPARING",
    Running = "RUNNING",
    Stopping = "STOPPING",
    Stopped = "STOPPED",
    Failed = "FAILED",
    Disposed = "DISPOSED",
    Finished = "FINISHED",
    ServiceData = "SERVICEDATA",
    UserActionCancel = "CANCELLED",
    UserActionKill = "KILLED"
}

/**
 * A message exchanged over a websocket connection.
 */
export class WebsocketMessage<T>{

    /**
     * Current status.
     */
     public readonly status: string;

     /**
      * Message.
      */
     public readonly message: string;
 
     /**
      * Message creation timestamp.
      */
     public readonly timestamp: Date;
 
     /**
      * Optional Message source.
      */
     public source: string;
 
     /**
      * Optional context. Here we can provide any additional info. 
      */
     public context?: T;

    constructor(status: string, message: string, context?: T, source?:string) {
        this.status = status;
        this.message = message;
        this.timestamp = new Date();
        this.source = (source) ? source : "";
        this.context = context;
    }
}

export class ExecutionStats {

    public currentStep: number = 0;

    public totalSteps: number = 0;

    public steps: ExecutionStep[] = [];

    public workflowName: string = "";

    public startTimestamp: Date = new Date();

    /**
     * Execution log. This will be included only when the invocation status is "Finished".
     */
     public logId: string = "";

     /**
      * Execution log Status. This will be included only when the invocation status is "Finished".
      */
     public logStatus: string = "";

     /**
      * Indicates if a execution is in progress.
      */
     public isRunning: boolean = false;

    constructor() {
    }
}
