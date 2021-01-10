import { SchemaDefinition } from "./schema-definition";
import { Utils } from "../utils/utils";

/**
 * Represents a field that is part of a schema definition.
 */
export class SchemaField {

    private _schema: SchemaDefinition | undefined;

    /**
    * Field name.
    */
    public name: string;

    /**
     * Field description.
     */
    public description: string = "";

    /**
     * Field type. Like: String, Number u other SchemaDefinition instance too.
     */
    public type: any;

    /**
     * Indicates if a value is required for this field.
     */
    public isRequired: boolean = true;

    /**
     * Indicates if the field represents a unique value.
     */
    public isUnique: boolean = true;

    /**
     * A boolean value indicating if this field is a collection of values instead of a scalar value.
     */
    public isArray: boolean = false;

    /**
     * Indicates if the field is an audit field, (like when was lastly modified, which user did it, etc...
     */
    public isAudit: boolean = false;

    /**
     * Indicates if this is an internal field.
     */
    public isInternal: boolean = false;

    /**
     * Indicates if the field value is a unique identifier.
     */
    public isId: boolean = false;

    /**
     * Returns the schema this field belongs to.
     */
    get schema(): SchemaDefinition | undefined {
        return this._schema;
    }

    /**
     * When the field is an embedded schema, the type and input 
     * name will be composed as {Schema name}{field name}. This is because embedded schemas are 
     * not entity schemas.
     */
    get fieldName(): string {
        let ret: string = Utils.capitalize(this.name);

        if (this.isEmbedded) {
            ret = `${this._schema?.name}${ret}`
        }

        return ret;
    }

    /**
     * Boolean value that indicates if the type of this field is actually an **SchemaDefinition**.
     * This indicates this field is a reference to an antity schema or an embedded or sub schema.
     */
    get typeIsSchema(): boolean {
        return this.type && this.type instanceof SchemaDefinition;
    }

    /**
     * True if this field type is an scalar value.
     */
    get IsScalar(): boolean {
        return !this.typeIsSchema;
    }

    /**
     * True if this field is not a scalar type but an embedded or sub schema.
     */
    get isEmbedded(): boolean {
        return this.typeIsSchema && !this.type.isEntity;
    }

    /**
     * True if this field is not a scalar type but a reference to an Entity schema.
     */
    get isReference(): boolean {
        return this.typeIsSchema && this.type.isEntity;
    }

    /**
     * @param name Field name.
     * @param description Field description.
     * @param fieldDefinition The field definition contains specific field attributes. 
     */
    constructor(name: string, description?: string, fieldDefinition?: FieldDefinition | any) {
        this.name = name;
        this.description = (description) ? description : "";

        if (!fieldDefinition) {
            fieldDefinition = new FieldDefinition();
        }

        this.type = (fieldDefinition.type) ? fieldDefinition.type : String;
        this.isRequired = Boolean(fieldDefinition.isRequired);
        this.isArray = Boolean(fieldDefinition.isArray);
        this.isUnique = Boolean(fieldDefinition.isUnique);
        this.isAudit = Boolean(fieldDefinition.isAudit);
        this.isInternal = Boolean(fieldDefinition.isInternal);
        this.isId = Boolean(fieldDefinition.isId);
    }

    /**
     * Allows to set a parent reference to the schema this field belongs to.
     * @param schema Schema this firld belongs.
     */
    setSchema(schema: SchemaDefinition) {
        this._schema = schema;
    }
}

/**
 * Schema details about the field definition.
 */
export class FieldDefinition {

    /**
     * Field type. Like: String, Number u other SchemaDefinition instance too.
     */
    public type: any = String;

    /**
     * Indicates if a value is required for this field.
     */
    public isRequired: boolean = false;

    /**
     * Indicates if the field represents a unique value.
     */
    public isUnique: boolean = false;

    /**
     * A boolean value indicating if this field is a collection of values instead of a scalar value.
     */
    public isArray: boolean = false;

    /**
     * Indicates if the field is an audit field, (like when was lastly modified, which user did it, etc...
     */
    public isAudit: boolean = false;

    /**
     * Indicates if this is an internal field.
     */
    public isInternal: boolean = false;

    /**
     * Indicates if the field value is a unique identifier.
     */
    public isId: boolean = false;

    constructor() {

    }
}