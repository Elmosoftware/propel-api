// @ts-check

import { Schema } from "mongoose"
import { NativeSchema } from "./native-schema";

/**
 * Represent the value assigned to one parameter of a Script.
 */
export class ParameterValue implements NativeSchema {

    /**
     * Parameter name.
     */
    public name: string = "";

    /**
     * Parameter value.
     */
    public value: string = "";

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
                DESCRIPTION: `Parameter name.`
            },
            value: {
                type: String,
                required: false,
                DESCRIPTION: `Parameter value`
            }
        },
            {
                _id: false //This will be an embedded document, so no "_id" field is needed here. 
            });
    }
}