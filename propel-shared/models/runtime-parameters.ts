// @ts-check
import { ParameterValue } from "./parameter-value";

/**
 * This calls is designed to exchange the runtime parameters edited by a user 
 * for a particular Workflow execution.
 */
export class RuntimeParameters {

    /**
     * Workflow step index.
     */
    public stepIndex: number = 0;

    /**
     * Parameter values.
     * Intended to contain only the runtime parameters of a particular WorkflowStep.
     */
    public values: ParameterValue[] = [];

    constructor() {
    }
}