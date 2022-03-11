// @ts-check
import { AuditedEntity } from "./audited-entity";
import { ScriptParameter } from "./script-parameter";

/**
 * Represents a Script uploaded by the user.
 */
export class Script extends AuditedEntity {

    /**
     * Script name.
     */
    public name: string = "";

    /**
     * Brief description of the script that can help others to use it.
     */
    public description: string = "";

    /**
     * Boolean value indicating if this script requires a target selection or not.
     */
    public isTargettingServers: boolean = true;

    /**
     * Script code.
     */
    public code: string = "";

    /**
     * Collection of script parameters inferred for the script.
     */
    public parameters: ScriptParameter[] = [];

    /**
     * Indicate if the script is enabled, threfore can be used in a Quick Task or Workflow. 
     * If the value is "false", the execution will be skipped on any Workflow or Task that have it.
     */
    public enabled: boolean = true;

    constructor() {
        super();
    }
}