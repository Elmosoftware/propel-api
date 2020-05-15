// @ts-check

import { Schema } from "mongoose"
import { NativeSchema } from "./native-schema";
import { APIError } from "../core/api-error";

/**
 * Represents the errors returned during a script invocation.
 */
export class ExecutionError implements NativeSchema {

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

    constructor(error?: Error | string) {
        let e: APIError;
        
        if (error) {
            e = new APIError(error);
            this.message = e.message;
            this.stack = e.stackArray;
        }
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