/**
 * This status reflects the ending overall state of a Workflow. Also used for a 
 * single workflow step or even a target execution.
 */
export enum ExecutionStatus {

    /**
     * Initial status, no actions have been taken yet.
     * Applies to: Workflow, Steps, Targets. 
     */
    Pending = "PENDING",

    /**
     * Is right now executing.
     * Applies to: Workflow, Steps, Targets.
     */
    Running = "RUNNING",

    /**
     * No errors at all, every step and target works as expected, none reported errors of any kind.
     * Applies to: Workflows, Steps, Targets.
     */
    Success = "SUCCESS",

    /**
     * The execution ended, but there was at least one error on any of the steps. This errors are 
     * not considered critical. So, the execution was able to go on and finish. 
     * Applies to: Workflows, Steps, Targets.
     */
    Faulty = "FAULTY",

    /**
     * There were errors during the execution that cause subsequent steps to be aborted based on 
     * the step configuration of the workflow.
     * Applies to: Workflows, Steps.
     */
    Aborted = "ABORTED",

    /**
     * The step or target was skipped based on his enable attribute.
     * Applies to: Steps and Targets.
     */
    Skipped = "SKIPPED",

    /**
     * The user cancelled the execution. This aborts any step not already executed at the moment 
     * the cancel signal was sent.
     */
    CancelledByUser = "CANCELLED"
}