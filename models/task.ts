// @ts-check
import { model, Schema } from "mongoose"
import { AuditedEntity } from "./audited-entity";
import { NativeModel } from "./native-model";
import { Script } from "./script";
import { Target } from "./target";
import { ParameterValue } from "./parameter-value";

/**
 * A task is the representation of one single script execution in none, one or many targets.
 */
export class Task extends AuditedEntity implements NativeModel {

    /**
     * Script to be executed.
     */
    public script!: Script;

    /**
     * Values to assign to the script parameters during the task execution.
     */
    public values: ParameterValue[] = [];

    /**
     * Collection of targets for the task execution.
     */
    public targets: Target[] = [];

    constructor() {
        super();
    }

    /**
     * Returns a Native model object.
     * @implements NativeModel.getModel()
     */
    getModel(): any {
        let s: Schema = super.getSchema();
        let parameterValueEmbeddedSchema = (new ParameterValue()).getSchema();

        //Adding model fields:
        s.add({
            script: {
                type: Schema.Types.ObjectId, 
                ref: "script", 
                required: true,
                DESCRIPTION: `Script to be executed.`
            }
        });
        s.add({
            values: [parameterValueEmbeddedSchema]
        });
        s.add({
            targets: [{
                type: Schema.Types.ObjectId, 
                ref: "target", 
                required: true,
                DESCRIPTION: `Collection of targets for the task execution.`
            }]
        });

        //Adding model indexes:
        s.index({ _id: 1, deletedOn: 1 }, { unique: true, background: true, name: "IU_EntityConstraint" });

        //Model description:
        // @ts-ignore
        s.DESCRIPTION = `Representation of one single script execution in none, one or many targets`;

        return model("task", s, "tasks");
    }
}