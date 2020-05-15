// @ts-check
import { Schema } from "mongoose"
import { NativeSchema } from "./native-schema";
import { ExecutionError } from "./execution-error";
import { ExecutionStatus } from "./execution-status";

/**
 * Results and errors of a script execution on one particular target.
 */
export class ExecutionTarget implements NativeSchema {

    /**
     * Target fully qualified name.
     */
    public FQDN: string = "";

    /**
     * Target name or an empty string if the script hits no targets.
     */
    public name: string = "";

    /**
     * The collection of results delivered by the script in this invocation.
     */
    public execResults: any[] = [];

    /**
     * Collection of errors as result of this target execution.
     */
    public execErrors: ExecutionError[] = [];

    /**
     * Finished execution status for the step. 
     */
    public status: ExecutionStatus = ExecutionStatus.Pending;

    constructor() {
    }

    /**
     * Returns a Native schema.
     * @implements NativeSchema.getSchema()
     */
    getSchema(): Schema {
        let executionErrorEmbeddedSchema = (new ExecutionError()).getSchema();

        return new Schema({ 
            FQDN: {
                type: String,
                required: false,
                DESCRIPTION: `Target fully qualified nameor an empty string if the script hits no targets.`
            },
            name: {
                type: String,
                required: false,
                DESCRIPTION: `Target name or an empty string if the script hits no targets.`
            },
            execResults: [{
                type: Object,
                required: true,
                DESCRIPTION: `The collection of results delivered by the script in this invocation.`
            }],
            execErrors: [executionErrorEmbeddedSchema],
            status: {
                type: String,
                required: true,
                DESCRIPTION: `Execution Status.`
            }
        },
            {
                _id: false //This will be an embedded document, so no "_id" field is needed here. 
            });
    }
}