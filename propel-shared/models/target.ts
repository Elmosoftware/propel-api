// @ts-check
import { AuditedEntity } from "./audited-entity";
import { Group } from "./group";
import { Credential } from "../models/credential";

/**
 * Represents the Target of an invocation. It have any infomation required to describe a target server.
 */
export class Target extends AuditedEntity {

    /**
     * Fully Qualified Domain Name of the target server.
     */
    public FQDN: string = "";

    /**
     * Target Server friendly name.
     */
    public friendlyName: string = "";

    /**
     * Brief description of the target server. It must help to clarify server purpose, usage, location, etc.
     */
    public description: string = "";

    /**
     * List of groups this server is member of.
     */
    public groups: Group[] = [];

    /**
     * Indicate if the server is enabled as target. If the value is "false", the execution will be 
     * skipped on any Workflow or Task that have it.
     */
    public enabled: boolean = true;

    /**
     * Always invoke this target server using this specific credentials.
     * This is an optional value.
     */
     public invokeAs!: Credential;

    constructor() {
        super();
    }
}