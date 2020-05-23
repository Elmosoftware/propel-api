// @ts-check
import { ExecutionError } from "./execution-error";
import { ExecutionStatus } from "./execution-status";

/**
 * Results and errors of a script execution on one particular target.
 */
export class ExecutionTarget {

    /**
     * Target fully qualified name.
     */
    public FQDN: string = "";

    /**
     * Target name or an empty string if the script hits no targets.
     */
    public name: string = "";

    /**
     * The collection of results delivered by the script in this invocation.
     */
    public execResults: any[] = [];

    /**
     * Collection of errors as result of this target execution.
     */
    public execErrors: ExecutionError[] = [];

    /**
     * Finished execution status for the step. 
     */
    public status: ExecutionStatus = ExecutionStatus.Pending;

    constructor() {
    }
}