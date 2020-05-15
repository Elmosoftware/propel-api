// @ts-check
import { Schema } from "mongoose"
import { NativeSchema } from "./native-schema";
import { ExecutionTarget } from "./execution-target";
import { ParameterValue } from "./parameter-value";
import { ExecutionStatus } from "./execution-status";
import { ExecutionError } from "./execution-error";

/**
 * Details of a Workflow step execution. 
 */
export class ExecutionStep implements NativeSchema {

    /**
     * Step name.
     */
    public stepName: string = "";

    /**
     * Name of the script.
     */
    public scriptName: string = "";

    /**
     * Parameter values used in the script execution.
     */
    public values: ParameterValue[] = [];

    /**
     * All the targets and the gathered results and/or errors on each one.
     */
    public targets: ExecutionTarget[] = [];

    /**
     * Finished execution status for the step. 
     */
    public status: ExecutionStatus = ExecutionStatus.Pending;

    /**
     * Step error. This is not related to the execution in the targets but any error that 
     * could prevent the step to start. Mostly related to object pool issues.
     */
    public execError: ExecutionError | null = null;

    constructor() {
    }

    /**
     * Returns a Native schema.
     * @implements NativeSchema.getSchema()
     */
    getSchema(): Schema {
        let executionTargetEmbeddedSchema = (new ExecutionTarget()).getSchema();
        let executionErrorEmbeddedSchema = (new ExecutionError()).getSchema();
        let parameterValueEmbeddedSchema = (new ParameterValue()).getSchema();

        return new Schema({
            stepName: {
                type: String,
                required: true,
                DESCRIPTION: `Step name.`
            },
            scriptName: {
                type: String,
                required: true,
                DESCRIPTION: `Script name.`
            },
            values: [parameterValueEmbeddedSchema],
            targets: [executionTargetEmbeddedSchema],
            status: {
                type: String,
                required: true,
                DESCRIPTION: `Execution Status.`
            },
            execError: executionErrorEmbeddedSchema
        },
            {
                _id: false //This will be an embedded document, so no "_id" field is needed here. 
            });
    }
}