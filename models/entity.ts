// @ts-check
import { Schema } from "mongoose"
import { NativeSchema } from "./native-schema";

/**
 * This is the most basic entity definition. All persisted entities ust inherit this common set.
 */
export class Entity implements NativeSchema {

    /**
     * Entity unique identifier.
     */
    public _id: string = "";

    /**
     * This is an internal field used for the soft deletion feature. 
     */
    public deletedOn: Date | null = null;

    constructor() {
    }

    /**
     * Returns a Native schema.
     * @implements NativeSchema.getSchema()
     */
    getSchema(): Schema {
        return new Schema({
            /**
             * Internal use only for the "soft deletion" feature.
             */
            deletedOn: {
                type: Date,
                required: false,
                INTERNAL: true,
                DESCRIPTION: `Soft delete timestamp.`
            }
        });
    }
}