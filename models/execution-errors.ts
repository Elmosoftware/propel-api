// @ts-check

import { Schema } from "mongoose"
import { NativeSchema } from "./native-schema";

/**
 * Represents the errors returned during a script invocation.
 */
export class ExecutionErrors implements NativeSchema {

    /**
     * Error Timestamp.
     */
    public throwAt: Date = new Date();
    
    /**
     * Error message.
     */
    public message: string = "";

    /**
     * Stack trace.
     */
    public stack: string[] = [];

    constructor() {
    }

    /**
     * Returns a Native schema.
     * @implements NativeSchema.getSchema()
     */
    getSchema(): Schema {
        return new Schema({
            throwAt: {
                type: Date,
                required: true,
                DESCRIPTION: `Error Timestamp.`
            },
            message: {
                type: String,
                required: false,
                DESCRIPTION: `Error message.`
            },
            stack: [{
                type: String,
                required: false,
                DESCRIPTION: `Stack trace.`
            }]
        },
            {
                _id: false //This will be an embedded document, so no "_id" field is needed here. 
            });
    }
}