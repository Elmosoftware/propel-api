// @ts-check
import { AuditedEntity } from "./audited-entity";
import { ScriptParameter } from "./script-parameter";
import { Category } from "./category";

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
     * Boolean value that indicates if the script is a System script or one uploaded by the User.
     * Users are able to use System scripts, but not able to alter them.
     */
    public isSystem: boolean = false;

    /**
     * Boolean value indicating if this script requires a target selection or not.
     */
    public isTargettingServers: boolean = true;

    /**
     * Target categories that could be a possible selection for this script. If no 
     * categories defined, any target could apply.
     */
    public category!: Category;

    /**
     * Indicates if the script is not modifieng target server state in any way.
     */
    public readonly: boolean = true;

    /**
     * Script code.
     */
    public code: string = "";

    /**
     * Collection of script parameters inferred for the script.
     */
    public parameters: ScriptParameter[] = [];

    constructor() {
        super();
    }
}