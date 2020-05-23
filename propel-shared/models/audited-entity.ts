// @ts-check
import { Entity } from "./entity";

/***
 * This class extends Entity by adding audit capabilities.
 */
export class AuditedEntity extends Entity {

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
}