import { Schema, Model, model } from "mongoose";

/**
 * Entity schema definition
 */
export class SchemaDefinition {

    /**
     * Field definitions.
     */
    public fieldDefinition: any;
    
    /**
     * Schema options 
     */
    public options: any;

    /**
     * Schema description.
     */
    public description: string = "";

    /**
     * Schema name.
     */
    public name: string = "";

    /**
     * Plural schema name, used later for collections of this type.
     */
    public pluralName: string = "";

    constructor(fieldDefinition: any, options: any = null) {
        this.fieldDefinition = fieldDefinition;
        this.options = options;
    }

    /**
     * Allows to add the supplied fields to this schema.
     * @param schema Schema to merge
     */
    merge(schema: SchemaDefinition): SchemaDefinition {
        this.fieldDefinition = { ...schema.fieldDefinition, ...this.fieldDefinition };
        return this;
    }

    /**
     * Brief description of the schema.
     * @param description Schema description
     */
    setDescription(description: string): SchemaDefinition {
        this.description = description;
        return this;
    }

    /**
     * Allows to set the schema name.
     * @param name Singular schema name.
     * @param pluralName Plural schema name.
     */
    setNames(name: string, pluralName: string): SchemaDefinition {
        this.name = name;

        if (!pluralName) {
            this.pluralName = this._defaultPluralName();
        }
        else {
            this.pluralName = pluralName;
        }

        return this;
    }

    /**
     * Returns a Mongoose schema created from this schema definition.
     */
    asMongooseSchema(): Schema {
        let s = new Schema(this.fieldDefinition, this.options);
        // @ts-ignore
        s.DESCRIPTION = this.description;
        return s;
    }

    /**
     * Returns a Mongoos model created from this schema definition.
     */
    asMongooseModel(): Model<any> {
        if (!this.name) {
            throw new Error(`The name of the schema definitions has not been set. This is required in order to create the mongoose model.`);
        }

        if (!this.pluralName) {
            this.pluralName = this._defaultPluralName();
        }

        return model(this.name, this.asMongooseSchema(), this.pluralName);
    }

    private _defaultPluralName(): string {
        return `${name}s`;
    }
}