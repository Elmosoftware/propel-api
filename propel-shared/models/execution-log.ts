// @ts-check
import { Entity } from "./entity";
import { Workflow } from "./workflow";
import { ExecutionStep } from "./execution-step";
import { User } from "./user";
import { ExecutionStatus } from "./execution-status";

/**
 * Full log of Workflow execution outcomes.
 */
export class ExecutionLog extends Entity {

    /**
     * Executed Workflow.
     */
    public workflow!: Workflow;
    
    /**
     * Execution start timestamp.
     */
    public startedAt!: Date;

    /**
     * Execution end timestamp.
     */
    public endedAt!: Date;

    /**
     * Workflow execution status.
     */
    public status!: ExecutionStatus;
    
    /**
     * User that trigger the Workflow execution.
     */
    public user!: User;

    /**
     * Details of each one of the steps in the workflow execution.
     */
    public executionSteps: ExecutionStep[] = [];

    constructor() {
        super();
    }
}