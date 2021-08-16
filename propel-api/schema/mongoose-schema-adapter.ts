import { Schema, Model, model } from "mongoose";
import { fieldEncryption } from 'mongoose-field-encryption';

import { PropelError } from "../../propel-shared/core/propel-error";
import { SchemaDefinition } from "../../propel-shared/schema/schema-definition";
import { SchemaField } from "../../propel-shared/schema/schema-field";
import { cfg } from "../core/config";

/**
 * Schema definition adapter to migrate our entity schema definition to specific Mongoose
 * schemas and models.
 */
export class MongooseSchemaAdapter {

    constructor() {
    }

    /**
     * Returns a Mongoose schema based on a schema definition.
     */
    asSchema(schemaDef: SchemaDefinition | Readonly<SchemaDefinition>): Schema {

        let ret: Schema;
        let entitySchema: any = {}
        let options: any = null;
        let encryptedfields: string[] = [];

        if (!schemaDef || schemaDef.getFields().length == 0) {
            throw new PropelError(`Parameter "schemaDef" is a null reference or doesn't have defined fields.`);
        }

        if (!schemaDef.isEntity) {
            options = {
                _id: false //Is an embedded document, so no "_id" field is needed here. 
            }
        }

        //We set the "excludeId" in true, because the ID is part of the definitions, but it will 
        //be added automatically by mongoose:
        schemaDef.getFields(true).forEach((field: SchemaField) => {

            let fieldDefinition: any = {};
            let isEmbedded: boolean = false;
            
            if (!field.type) throw new PropelError(
                `The field type is not defined for field "${field.name}" on schema "${(!field.schema) ? "UNSET SCHEMA" : field.schema.name}" has not schema set!`)

            //A field can refer to another schema:
            if (field.type instanceof SchemaDefinition) {
                //If the field is holding a reference to an entity field:
                if (field.type.isEntity) {
                    fieldDefinition.type = Schema.Types.ObjectId;
                    if (!field.schema) throw new PropelError(
                        `The field "${field.name}" has not schema set!`)
                    fieldDefinition.ref = field.type.name;
                }
                else { //Therefore is an embedded type:
                    //The field definition will be the mongoose schema:
                    fieldDefinition = this.asSchema(field.type);
                    isEmbedded = true;
                }
            }
            else {
                fieldDefinition.type = field.type;
            }

            if (!isEmbedded) {
                if (field.isUnique) {
                    fieldDefinition.unique = true;
                }

                if (field.isRequired) {
                    fieldDefinition.required = true;
                }
            }

            if (field.mustBeEncripted) {
                encryptedfields.push(field.name);
            }
         
            entitySchema[field.name] = (field.isArray) ? [fieldDefinition] : fieldDefinition;
        })

        ret = new Schema(entitySchema, options);

        //If there is at least one field that need to be encrypted:
        if (encryptedfields.length > 0) {
            ret.plugin(fieldEncryption, { fields: encryptedfields, secret: cfg.encryptionKey });
        }

        return ret;
    }

    /**
     * Returns a Mongoose model based on a schema definition.
     */
    asModel(schemaDef: SchemaDefinition | Readonly<SchemaDefinition>): AdapterModel {

        let ret: AdapterModel;

        if (!schemaDef.name) {
            throw new PropelError(`The name of the schema definitions has not been set. This is required in order to create the mongoose model.`);
        }

        ret = new AdapterModel(schemaDef.name,
            model(schemaDef.name, this.asSchema(schemaDef), schemaDef.pluralName),
            this._buildPopulateSchema(schemaDef.getFields(true)),
            schemaDef.internalFieldsList,
            schemaDef.auditFieldsList);

        return ret;
    }
    
    private _buildPopulateSchema(fields: SchemaField[], parentField?: SchemaField): any[] {

        let populateSchema: any[] = [];
        let populate: any[];
        let childFields: SchemaField[];

        fields.forEach((field: SchemaField) => {

            // if (this._typeIsSchema(field.type)) {
            if (field.typeIsSchema) {

                // if (this._fieldIsReference(field)) {
                if (field.isReference) {
                    //If the field is a reference it need to be populated always. 
                    //The only consideration is: If the parent is an embedded object, this entry will 
                    //be added later as soon we get his below childs references, (if any).
                    if (!parentField || (parentField && !parentField.isEmbedded)) {
                        populateSchema.push({
                            path: field.name
                        });
                    }
                }

                childFields = field.type.getFields();
                //We look recursively into child and subchild fields, looking for any other 
                //references that need to be populated too:
                populate = this._buildPopulateSchema(childFields, field);

                //If there is any child references:
                if (populate.length > 0) {
                    //In the case of embedded fields there is no point to add the populate path 
                    //at least they have some reference subfields that need to be populated too. That's
                    //why we add this entry at this point after checking if there is any child references:
                    if (parentField && parentField.isEmbedded) {
                        populateSchema.push({
                            //In the case of embeded fields sub references, we need to add the 
                            //parent embedded field name to the path also:
                            path: `${parentField.name}.${field.name}`
                        });
                    }

                   //Embedded field references need to be added individually:
                    if (field.isEmbedded) {
                        populateSchema = populateSchema.concat(populate);
                    }
                    else {  
                        //If is a reference of another reference we need to ad it as a child:
                        populateSchema[populateSchema.length - 1].populate = populate;
                    }
                }
            }
        });

        return populateSchema
    }
}

/**
 * This represents the mongoose adapter results.
 */
export class AdapterModel {

    /**
     * Model name
     */
    public readonly name: string;

    /**
     * Mongoose model
     */
    public readonly model: Model<any>;

    /**
     * A collection that represent the populate schema for this model. This allows the 
     * automatic population of all the entity references. 
     */
    public readonly populateSchema: any[];

    public readonly internalFieldsList: string[];

    public readonly auditFieldsList: string[];

    constructor(name: string, model: Model<any>, populateSchema: any[], 
        internalsFieldsList: string[], auditFieldsList: string[] ) {
        this.name = name;
        this.model = model;
        this.populateSchema = populateSchema;
        this.internalFieldsList = internalsFieldsList;
        this.auditFieldsList = auditFieldsList;
    }

    /**
     * Returns a boolean value indicating if there is an internal field with that name.
     * Search is case insensitive.
     * @param {string} fieldName Field name to search for.
     */
    hasInternalField(fieldName: string): boolean {
        return this.internalFieldsList.length > 0 && this.internalFieldsList.some((field: string) => {
            return field.toLowerCase() == field.toLowerCase();
        })
    }

    /**
     * Returns a boolean value indicating if there is an audit field with that name.
     * Search is case insensitive.
     * @param {string} fieldName Field name to search for.
     */
    hasAuditField(fieldName: string): boolean {
        return this.auditFieldsList.length > 0 && this.auditFieldsList.some((field: string) => {
            return field.toLowerCase() == field.toLowerCase();
        })
    }
}