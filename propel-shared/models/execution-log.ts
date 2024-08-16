// @ts-check
import { Entity } from "./entity";
import { Workflow } from "./workflow";
import { ExecutionStep } from "./execution-step";
import { UserAccount } from "./user-account";
import { ExecutionStatus } from "./execution-status";
import { ExecutionError } from "./execution-error";

/**
 * Full log of Workflow execution outcomes.
 */
export class ExecutionLog extends Entity {

    /**
     * Workflow level error. Not null value here indicates the Workflow was not able to start because some
     * problem with the Workflow preparation. Some usual problems here are:
     * - The Workflow doesn't exists.
     * - Some parameter reference a credential that is gone.
     * - Some changes in a script parameters prevent the Workflow to start.
     */
    public execError: ExecutionError | null = null;

    /**
     * Executed Workflow.
     */
    public workflow: Workflow | null = null;
    
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
    public user!: UserAccount;

    /**
     * Details of each one of the steps in the workflow execution.
     */
    public executionSteps: ExecutionStep[] = [];

    constructor() {
        super();
    }
}