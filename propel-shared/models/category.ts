// @ts-check
import { AuditedEntity } from "./audited-entity";

/**
 * Represents Categories to be used by the scripts.
 */
export class Category extends AuditedEntity {

    /**
     * Category name.
     */
    public name: string = "";

    constructor() {
        super();
    }
}