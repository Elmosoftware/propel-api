// @ts-check
import { AuditedEntity } from "./audited-entity";

/**
 * Allows to implement groups of targets.
 */
export class Group extends AuditedEntity {

    /**
     * Group name.
     */
    public name: string = "";

    constructor() {
        super();
    }
}