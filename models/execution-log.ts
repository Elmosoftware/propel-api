// @ts-check
import { model, Schema } from "mongoose"
import { Entity } from "./entity";
import { NativeModel } from "./native-model";
import { Workflow } from "./workflow";
import { ExecutionStep } from "./execution-step";
import { User } from "./user";
import { ExecutionStatus } from "./execution-status";

/**
 * Full log of Workflow execution outcomes.
 */
export class ExecutionLog extends Entity implements NativeModel {

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

    /**
     * Returns a Native model object.
     * @implements NativeModel.getModel()
     */
    getModel(): any {
        let s: Schema = super.getSchema();
        let executionStepsEmbeddedSchema = (new ExecutionStep()).getSchema();

        //Adding model fields:
        s.add({
            workflow: {
                type: Schema.Types.ObjectId, 
                ref: "workflow", 
                required: true,
                DESCRIPTION: `Executed Workflow.`
            }
        });
        s.add({
            startedAt: {
                type: Date,
                required: true,
                DESCRIPTION: `Start timestamp (UTC).`
            }
        });
        s.add({
            endedAt: {
                type: Date,
                required: true,
                DESCRIPTION: `End timestamp (UTC).`
            }
        });
        s.add({
            status: {
                type: String, 
                required: true,
                DESCRIPTION: `Execution Status.`
            }
        });
        s.add({
            user: {
                type: Schema.Types.ObjectId, 
                ref: "user", 
                required: true,
                DESCRIPTION: `User that starts the execution.`
            }
        });
        s.add({
            executionSteps: [executionStepsEmbeddedSchema]
        });

        //Adding model indexes:
        s.index({ _id: 1, deletedOn: 1 }, { unique: true, background: true, name: "IU_EntityConstraint" });

        //Model description:
        // @ts-ignore
        s.DESCRIPTION = `Full log of Workflow execution outcomes.`;

        return model("executionlog", s, "executionlogs");
    }
}