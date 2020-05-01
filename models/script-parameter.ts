// @ts-check

import { Schema } from "mongoose"
import { NativeSchema } from "./native-schema";

/**
 * Represents one inferred script parameter.
 */
export class ScriptParameter implements NativeSchema {

    /**
     * Parameter position as described in the script.
     */
    public position: number = 0;

    /**
     * Parameter name.
     */
    public name: string = "";

    /**
     * Optional parameter description.
     */
    public description: string = "";

    /**
     * If defined in the parameter, the PowerShell type.
     */
    public nativeType: string = "";

    /**
     * If the native type is defined, this will be the Javascript type used for conversion purposes.
     */
    public type: string = "";

    /**
     * A boolean value indicating if the parameter is mandatory.
     */
    public required: boolean = false;

    /**
     * If the parameter has specified a valid set, this propety will keep the valid values the parameter can have.
     */
    public validValues: string[] = [];

    /**
     * A boolean value indicating of the parameter can accept null values.
     */
    public canBeNull: boolean = true;

    /**
     * A boolean value indicating if the parameter value can be empty, (like an empty string or array). 
     */
    public canBeEmpty: boolean = true;

    /**
     * The parameter default value.
     */
    public defaultValue: string = "";

    constructor() {
    }

    /**
     * Returns a Native schema.
     * @implements NativeSchema.getSchema()
     */
    getSchema(): Schema {
        return new Schema({
            position: {
                type: Number,
                required: true,
                DESCRIPTION: `Index position of the argument in the script.`
            },
            name: {
                type: String,
                required: true,
                DESCRIPTION: `Argument name.`
            },
            description: {
                type: String,
                required: false,
                DESCRIPTION: `Argument description, (if available)`
            },
            nativeType: {
                type: String,
                required: true,
                DESCRIPTION: `Native PowerShell type.`
            },
            type: {
                type: String,
                required: true,
                DESCRIPTION: `JavaScript equivalent type.`
            },
            required: {
                type: Boolean,
                required: true,
                DESCRIPTION: `Boolean valueindicating if this parameter need to be present in an invocation.`
            },
            validValues: [{
                type: String,
                required: false,
                DESCRIPTION: `If defined, a set of valid values you can pass for an invocation.`
            }],
            canBeNull: {
                type: Boolean,
                required: true,
                DESCRIPTION: `Indicates if when present, the parameter value can be null.`
            },
            canBeEmpty: {
                type: Boolean,
                required: true,
                DESCRIPTION: `Indicates if when present, the parameter value can be empty, (like an empty string or array).`
            },
            defaultValue: {
                type: String,
                required: true,
                DESCRIPTION: `The parameter default value.`
            }
        },
            {
                _id: false //This will be an embedded document, so no "_id" field is needed here. 
            });
    }
}