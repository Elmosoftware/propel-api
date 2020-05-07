// @ts-check
import { Schema } from "mongoose"
import { NativeSchema } from "./native-schema";
import { ExecutionTargets } from "./execution-targets";
import { ParameterValue } from "./parameter-value";

/**
 * Details of a Workflow step execution. 
 */
export class ExecutionSteps implements NativeSchema {

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
     * Allthe targets and the gathered results and/or errors on each one.
     */
    public targets: ExecutionTargets[] = [];

    constructor() {
    }

    /**
     * Returns a Native schema.
     * @implements NativeSchema.getSchema()
     */
    getSchema(): Schema {
        let executionTargetsEmbeddedSchema = (new ExecutionTargets()).getSchema();
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
            targets: [executionTargetsEmbeddedSchema]
        },
            {
                _id: false //This will be an embedded document, so no "_id" field is needed here. 
            });
    }
}