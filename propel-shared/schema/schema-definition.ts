import { PropelError } from "../core/propel-error";
import { SchemaField } from "./schema-field";

/**
 * Entity schema definition
 */
export class SchemaDefinition {
    /**
     * Schema name.
     */
    public name: string = "";

    /**
     * Plural schema name, used later for collections of this type.
     */
    public pluralName: string = "";

    /**
     * Schema description.
     */
    public description: string = "";

    /**
     * Indicates if the schema represents a class that inherits from the Entity base class.
     * This indicates the class has defined a key identifier, (_id field).
     */
    public isEntity: boolean = true;

    /**
     * Retrieves a list of all the internal fields on this schema definition.
     */
    get internalFieldsList(): string[] {
        return this._internalFieldsList;
    }

    /**
     * Retrieves a list of all the audit fields on this schema definition.
     */
    get auditFieldsList(): string[] {
        return this._auditFieldsList;
    }

    private _fields: SchemaField[];
    private _internalFieldsList: string[];
    private _auditFieldsList: string[];

    /**
     * Schema definition constructor
     * @param entitySchema The entity schema including details like field type, if is required, etc.
     * @param isEntity Indicates if the schema inherits from @class Entity
     */
    constructor(name: string, pluralName?: string, isEntity: boolean = true) {
        this.name = name;
        this.pluralName = (pluralName) ? pluralName : this._defaultPluralName(name);
        this.isEntity = isEntity;
        this._fields = [];
        this._internalFieldsList = [];
        this._auditFieldsList = [];
    }

    /**
     * Add the supplied fields to the scheme. If one of the provided fields are already in the 
     * scheme and error will be thrown. 
     * @param fields Fields to be added to the scheme.
     * @throws PropelError if a field already exists.
     */
    setFields(fields: SchemaField[]): SchemaDefinition {
        this._addFields(fields);
        return this;
    }

    /**
     * 
     * @param excludeId Boolean value that indicates if fields that have the "isId" indicator 
     * will be excluded from the output.
     * @param excludeInternalFields Boolean value that indicates in the internal fields 
     * must be excluded from the output. 
     */
    getFields(excludeId: boolean = false, excludeInternalFields: boolean = false): SchemaField[] {
        return this._fields.filter((f: SchemaField) => {
            return (!excludeId || excludeId && !f.isId) && 
                (!excludeInternalFields || excludeInternalFields && !f.isInternal)
        })
    }

    /**
     * Allows to add the fields in the provided schema to the ones in this.
     * @param schema Schema to merge
     */
    merge(schema: SchemaDefinition | Readonly<SchemaDefinition>): SchemaDefinition {

        if (schema) {
            this._addFields(schema.getFields());
        }

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
     * Returns a read-only copy of this schema definition
     */
    freeze(): Readonly<SchemaDefinition> {
        return Object.freeze(this);
    }
    
    private _defaultPluralName(name: string): string {
        return `${name}s`;
    }

    private _addFields(fields: SchemaField[]): void {
        if (fields && fields.length > 0) {
            fields.forEach((field: SchemaField) => {
                this._addField(field);
            })
        }

        //Sorting fields by names helps to manage the schema:
        this._fields = this._fields.sort((a: SchemaField, b: SchemaField) => {
            let ret = 0

            if (a.name < b.name) {
                ret = -1;
            }
            else if (a.name > b.name) {
                ret = 1;
            }

            return ret;
        });
    }

    private _addField(field: SchemaField): void {
        //We are creating a new instance because we cannot set the schema on the original field!:
        let f: SchemaField = new SchemaField(field.name, field.description, field);
        f.setSchema(this); //now the field belongs to this schema.

        if (this._fields.some((item) => {
            item.name == f.name
        })) {
            throw new PropelError(`The field "${f.name}" is already defined in the schema "${this.name}".`)
        }
        else {
            this._fields.push(f);
        }

        if (f.isInternal) {
            this._internalFieldsList.push(f.name);
        }
        else if (f.isAudit) {
            this._auditFieldsList.push(f.name);
        }
    }
}