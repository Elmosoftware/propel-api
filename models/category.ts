
// @ts-check
import { model, Schema } from "mongoose"
import { AuditedEntity } from "./audited-entity";
import { NativeModel } from "./native-model";

/**
 * Represents Categories to be used by the scripts.
 */
export class Category extends AuditedEntity implements NativeModel {

    /**
     * Category name.
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
        s.add({ name: { type: String, required: true, DESCRIPTION: `Category name.` }});
        
        //Adding model indexes:
        s.index({ name: 1, deletedOn: 1 }, { unique: true, background: true, name: "IU_EntityConstraint" });

        //Model description:
        // @ts-ignore
        s.DESCRIPTION = `Workflow and script categories`;

        return model("category", s, "categories");
    }
}