// @ts-check
import { model, Schema } from "mongoose"
import { AuditedEntity } from "./audited-entity";
import { NativeModel } from "./native-model";
import { Category } from "./category";
import { WorkflowStep } from "./workflow-step";

/**
 * A Workflow represents reusable collection of steps. Each one running a task in one or 
 * more target servers.
 */
export class Workflow extends AuditedEntity implements NativeModel {

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

    /**
     * Returns a Native model object.
     * @implements NativeModel.getModel()
     */
    getModel(): any {
        let s: Schema = super.getSchema();
        let workflowStepEmbeddedSchema = (new WorkflowStep()).getSchema();

        //Adding model fields:
        s.add({
            name: {
                type: String, 
                required: true,
                unique: true,
                DESCRIPTION: `Step name.`
            }
        });
        s.add({
            description: {
                type: String, 
                required: false,
                DESCRIPTION: `Workflow brief description. Be sure to express intention here.`
            }
        });
        s.add({
            isPrivate: {
                type: Boolean, 
                required: true,
                DESCRIPTION: `Indicate if this is shared or not with other users.`
            }
        });
        s.add({
            category: {
                type: Schema.Types.ObjectId, 
                ref: "category", 
                required: true,
                DESCRIPTION: `Workflow category.`
            }
        });
        s.add({
            steps: [workflowStepEmbeddedSchema]
        });

        //Adding model indexes:
        s.index({ name: 1, deletedOn: 1 }, { unique: true, background: true, name: "IU_EntityConstraint" });

        //Model description:
        // @ts-ignore
        s.DESCRIPTION = `A Workflow represents a reusable collection of steps. Each one running a task in one or more target servers.`;

        return model("workflow", s, "workflows");
    }
}