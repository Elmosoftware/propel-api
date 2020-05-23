// @ts-check
import { Script } from "./script";
import { Target } from "./target";
import { ParameterValue } from "./parameter-value";

/**
 * Represent one step of a complete workflow. A workflow step contains a reference to the task that 
 * is going to be executed as also other properties that are establishing constraints that can 
 * alter the entire workflow execution. Like avoiding the workflow to continue if this step 
 * fails, skip this step if disabled, etc.
 */
export class WorkflowStep {

    /**
     * Step name.
     */
    public name: string = "";

    /**
     * If true, the step will be included in the workflow execution. otherwise will be skipped.
     */
    public enabled: boolean = true;

    /**
     * If true, the entire workflow will be aborted if this step fails. Otherwise, it will continue even after the failure.
     */
    public abortOnError: boolean = true;

    /**
     * Script to be executed.
     */
    public script!: Script;

    /**
     * Values to assign to the script parameters during the task execution.
     */
    public values: ParameterValue[] = [];

    /**
     * Collection of targets for the task execution.
     */
    public targets: Target[] = [];

    constructor() {
    }
}