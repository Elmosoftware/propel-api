// @ts-check
import { ExecutionTarget } from "./execution-target";
import { ParameterValue } from "./parameter-value";
import { ExecutionStatus } from "./execution-status";
import { ExecutionError } from "./execution-error";

/**
 * Details of a Workflow step execution. 
 */
export class ExecutionStep {

    /**
     * Step name.
     */
    public stepName: string = "";

    /**
     * Name of the script.
     */
    public scriptName: string = "";

    /**
     * Indicates if the script was disabled or deleted at the moment of the execution.
     */
    public scriptEnabled: boolean = true;

    /**
     * Parameter values used in the script execution.
     */
    public values: ParameterValue[] = [];

    /**
     * All the targets and the gathered results and/or errors on each one.
     */
    public targets: ExecutionTarget[] = [];

    /**
     * Finished execution status for the step. 
     */
    public status: ExecutionStatus = ExecutionStatus.Pending;

    /**
     * Step error. This is not related to the execution in the targets but any error that 
     * could prevent the step to start. Mostly related to object pool issues.
     */
    public execError: ExecutionError | null = null;

    constructor() {
    }
}