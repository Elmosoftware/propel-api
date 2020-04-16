// @ts-check
import { model, Schema } from "mongoose"
import { AuditedEntity } from "./audited-entity";
import { NativeModel } from "./native-model";

/**
 * Tags will be used by Targets and Scripts and allows to visualize easily the main functions they have.
 * Like: "File Server", "File System", "Web", "Database Engine Functions", etc.  
 */
export class Tag extends AuditedEntity implements NativeModel {

    /**
     * Tag name. Identifies an application area for Scripts and/or Targets.
     */
    public name: string = "";

    constructor() {
        super();
    }

    /**
     * Returns a Native model object.
     * @implements NativeModel.getModel()
     */
    getModel(): any {
        let s: Schema = super.getSchema()
        
        //Adding model fields:
        s.add({ name: { type: String, required: true, DESCRIPTION: `Unique tag.` }});
        
        //Adding model indexes:
        s.index({ name: 1, deletedOn: 1 }, { unique: true, background: true, name: "IU_EntityConstraint" });

        //Model description:
        // @ts-ignore
        s.DESCRIPTION = `Tag identifier`;

        return model("tag", s, "tags");
    }
}