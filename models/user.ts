// @ts-check
import { model, Schema } from "mongoose"
import { Entity } from "./entity";
import { NativeModel } from "./native-model";

export class User extends Entity implements NativeModel {

    public name: string = "";
    public email: string = "";
    public initials: string = "";
    public picture: string = "";

    constructor() {
        super();
    }

    getModel(): any {
        let s: Schema = super.getSchema()
        
        //Adding model fields:
        s.add({ name: { type: String, required: true, DESCRIPTION: `User name` }});
        s.add({ email: { type: String, required: true, DESCRIPTION: `User email. Is also unique identifier.` }});
        s.add({ initials: { type: String, required: true, DESCRIPTION: `User initials` }});
        s.add({ picture: { type: String, required: false, DESCRIPTION: `Optional user picture URL.` }});
        
        //Adding model indexes:
        s.index({ email: 1, deletedOn: 1 }, { unique: true, background: true, name: "IU_EntityConstraint" });
        s.index({ name: 1 }, { unique: false, background: true, name: "IX_UserName" });
        
        //Model description:
        // @ts-ignore
        s.DESCRIPTION = `Authenticated User`

        return model("user", s, "users");
    }
}