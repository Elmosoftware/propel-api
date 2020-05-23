// @ts-check
import { AuditedEntity } from "./audited-entity";
import { Category } from "./category";
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
     * Boolean value indicating if only the creator can alter and run it. Useful for testing 
     * purposes in order to ensure all is working as intended.
     */
    public isPrivate: boolean = false

    /**
     * Woekflow category.
     */
    public category!: Category;

    /**
     * Collection of steps, each one defining a task to be executed.
     */
    public steps: WorkflowStep[] = [];

    constructor() {
        super();
    }
}