
// @ts-check
import { model, Schema } from "mongoose"
import { AuditedEntity } from "./audited-entity";
import { NativeModel } from "./native-model";
import { ScriptParameter } from "./script-parameter";
import { Category } from "./category";

/**
 * Represents a Script uploaded by the user.
 */
export class Script extends AuditedEntity implements NativeModel {

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

    /**
     * Returns a Native model object.
     * @implements NativeModel.getModel()
     */
    getModel(): any {
        let s: Schema = super.getSchema();
        let scriptParameterEmbeddedSchema = (new ScriptParameter()).getSchema();

        //Adding model fields:
        s.add({
            name: {
                type: String,
                required: true,
                DESCRIPTION: `Script name.`
            }
        });
        s.add({
            description: {
                type: String,
                required: false,
                DESCRIPTION: `Brief description of the script that can help others to use it.`
            }
        });
        s.add({
            isSystem: {
                type: Boolean,
                required: true,
                DESCRIPTION: `Boolean value that indicates if the script is a System script or one uploaded by the User.
Users are able to use System scripts, but not able to alter them.Brief description of the script that can help others to use it.`
            }
        });
        s.add({
            isTargettingServers: {
                type: Boolean,
                required: true,
                DESCRIPTION: `Boolean value indicating if this script requires a target selection or not.`
            }
        });
        s.add({
            category: {
                type: Schema.Types.ObjectId,
                ref: "category",
                required: true,
                DESCRIPTION: `The script category, group scripts that have similar functionality. Helping in the creation of workflows to find and pick the right one.`
            }
        });
        s.add({
            readonly: {
                type: Boolean,
                required: true,
                DESCRIPTION: `Indicates if the script is not modifieng target server state in any way.`
            }
        });
        s.add({
            code: {
                type: String,
                required: true,
                DESCRIPTION: `Brief description of the script that can help others to use it.`
            }
        });
        s.add({
            parameters: [scriptParameterEmbeddedSchema]
        });

        //Adding model indexes:
        s.index({ name: 1, deletedOn: 1 }, { unique: true, background: true, name: "IU_EntityConstraint" });

        //Model description:
        // @ts-ignore
        s.DESCRIPTION = `Script definition`;

        return model("script", s, "scripts");
    }
}