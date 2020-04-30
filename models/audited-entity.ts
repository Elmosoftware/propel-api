// @ts-check
import { Schema } from "mongoose";
import { Entity } from "./entity";
import { NativeSchema } from "./native-schema";

/***
 * This class extends Entity by adding audit capabilities.
 */
export class AuditedEntity extends Entity implements NativeSchema {

    /**
     * Creation Timestamp.
     */
    public createdOn: Date | null = null;

    /**
     * User that creates the document.
     */
    public createdBy: string = "";

    /**
     * Last update timestamp.
     */
    public lastUpdateOn: Date | null = null;

    /**
     * Last user to update the document.
     */
    public lastUpdateBy: string = "";

    constructor() {
        super();
    }

    /**
     * Returns a Native schema.
     * @implements NativeSchema.getSchema()
     */
    getSchema(): Schema {
        let s: Schema = super.getSchema()
        /* 
            TODO:
                Below "CreatedBy" field must be set as required as soon we add the 
                user authentication & Authorization process in Propel.
        */
        s.add({
            createdBy: {
                type: Schema.Types.ObjectId,
                required: false,
                AUDIT: true,
                DESCRIPTION: `Creator User Identifier.`
            }
        });
        s.add({
            createdOn: {
                type: Date,
                required: true,
                AUDIT: true,
                DESCRIPTION: `Creation timestamp (UTC).`
            }
        });
        s.add({
            lastUpdateOn: {
                type: Date,
                required: false,
                AUDIT: true,
                DESCRIPTION: `Last update user identifier.`
            }
        });
        s.add({
            lastUpdateBy: {
                type: Schema.Types.ObjectId,
                required: false,
                AUDIT: true,
                DESCRIPTION: `Last update timestamp (UTC).`
            }
        });

        return s;
    }
}