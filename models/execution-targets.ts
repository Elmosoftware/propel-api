// @ts-check
import { Schema } from "mongoose"
import { NativeSchema } from "./native-schema";
import { ExecutionErrors } from "./execution-errors";

/**
 * Results and errors of a script execution on one particular target.
 */
export class ExecutionTargets implements NativeSchema {

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
     * If true, the entire workflow will be aborted if this step fails. Otherwise, it will continue even after the failure.
     */
    public execErrors: ExecutionErrors[] = [];

    constructor() {
    }

    /**
     * Returns a Native schema.
     * @implements NativeSchema.getSchema()
     */
    getSchema(): Schema {
        let executionErrorsEmbeddedSchema = (new ExecutionErrors()).getSchema();

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
            execErrors: [executionErrorsEmbeddedSchema]
        },
            {
                _id: false //This will be an embedded document, so no "_id" field is needed here. 
            });
    }
}