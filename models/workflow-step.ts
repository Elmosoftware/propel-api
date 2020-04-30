// @ts-check
import { Schema } from "mongoose"
import { NativeSchema } from "./native-schema";
import { Task } from "./task";

/**
 * Represent one step of a complete workflow. A workflow step contains a reference to the task that 
 * is going to be executed as also other properties that are establishing constraints that can 
 * alter the entire workflow execution. Like avoiding the workflow to continue if this step 
 * fails, skip this step if disabled, etc.
 */
export class WorkflowStep implements NativeSchema {

    /**
     * Step name.
     */
    public name: string = "";

    /**
     * Task to be executed.
     */
    public task!: Task;

    /**
     * If true, the step will be included in the workflow execution. otherwise will be skipped.
     */
    public enabled: boolean = true;

    /**
     * If true, the entire workflow will be aborted if this step fails. Otherwise, it will continue even after the failure.
     */
    public abortOnError: boolean = true;

    constructor() {
    }

    /**
     * Returns a Native schema.
     * @implements NativeSchema.getSchema()
     */
    getSchema(): Schema {
        return new Schema({
            name: {
                type: String,
                required: true,
                DESCRIPTION: `Step name.`
            },
            task: {
                type: Schema.Types.ObjectId, 
                ref: "task", 
                required: true,
                DESCRIPTION: `Task to be executed.`
            },
            enabled: {
                type: Boolean,
                required: true,
                DESCRIPTION: `Indicates if the step will be included in the workflow execution.`
            },
            abortOnError: {
                type: Boolean,
                required: true,
                DESCRIPTION: `If true, the entire workflow will be aborted if this step fails.`
            }
        },
            {
                _id: false //This will be an embedded document, so no "_id" field is needed here. 
            });
    }
}