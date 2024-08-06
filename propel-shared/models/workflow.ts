// @ts-check
import { AuditedEntity } from "./audited-entity";
import { WorkflowSchedule } from "./workflow-schedule";
import { WorkflowStep } from "./workflow-step";

/**
 * A Workflow represents reusable collection of steps. Each one running a task in one or 
 * more target servers.
 */
export class Workflow extends AuditedEntity {

    /**
     * Workflow unique name.
     */
    public name: string = ""
    
    /**
     * Workflow brief description including important information like what is intended 
     * for, expected changes, case applicability, etc.
     */
    public description: string = ""

    /**
     * Boolean value indicating if this is a quick task.
     * Quick tasks are not intended to endure, they are like "one time only" Workflows.
     */
    public isQuickTask: boolean = false

    /**
     * Collection of steps, each one defining a task to be executed.
     */
    public steps: WorkflowStep[] = [];

    /**
     * Schedule to run this Workflow automatically.
     */
    public schedule: WorkflowSchedule = new WorkflowSchedule();

    constructor() {
        super();
    }
}