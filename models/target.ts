// @ts-check
import { model, Schema } from "mongoose"
import { AuditedEntity } from "./audited-entity";
import { NativeModel } from "./native-model";
import { Group } from "./group";

/**
 * Represents the Target of an invocation. It have any infomation required to describe a target server.
 */
export class Target extends AuditedEntity implements NativeModel {

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

    constructor() {
        super();
    }

    /**
     * Returns a Native model object.
     * @implements NativeModel.getModel()
     */
    getModel(): any {
        let s: Schema = super.getSchema();

        //Adding model fields:
        s.add({
            FQDN: {
                type: String,
                required: true,
                DESCRIPTION: `Fully Qualified Domain Name of the target server.`
            }
        });
        s.add({
            friendlyName: {
                type: String,
                required: true,
                DESCRIPTION: `Target Server friendly name.`
            }
        });
        s.add({
            description: {
                type: String, 
                required: false,
                DESCRIPTION: `Brief description of the target server. It must help to clarify server purpose, usage, location, etc.`
            }
        });
        s.add({
            groups: [{
                type: Schema.Types.ObjectId, 
                ref: "group", 
                required: false,
                DESCRIPTION: `The script category, group scripts that have similar functionality. Helping in the creation of workflows to find and pick the right one.`
            }]
        });
        s.add({
            enabled: {
                type: Boolean, 
                required: true,
                DESCRIPTION: `Indicate if the server is enabled as target. If the value is "false", the execution will be skipped on any Workflow or Task that have it.`
            }
        });

        //Adding model indexes:
        s.index({ FQDN: 1, deletedOn: 1 }, { unique: true, background: true, name: "IU_EntityConstraint" });

        //Model description:
        // @ts-ignore
        s.DESCRIPTION = `Script definition`;

        return model("target", s, "targets");
    }
}