// @ts-check
import mongoose from "mongoose";

/**
 * This method add to the supplied schema definition, all the attributes that are common to any entity.
 * This also support the following custom field attributes:
 *  - INTERNAL {boolean}: Indicates if the field is for internal use only. If this attribute has the 
 * value "true", the field will be removed from the JSON delivered to the client.
 * @param {*} schemaDefinition Entity schema definition.
 * @param {boolean} includeAuditFields Indicates if audit fields must be added to the schema. Default value is true.
 * @returns The supplied SchemaDefinition with the added common entity attributes.
 */
export function addCommonEntityAttributes(schemaDefinition: any, includeAuditFields = true) {

    if (includeAuditFields) {
        schemaDefinition.createdOn = { type: Date, required: true, AUDIT: true}; 
        /* 
            TODO:
                Below "CreatedBy" field must be set as required as soon we add the 
                user authentication & Authorization process in Propel.
        */
        schemaDefinition.createdBy = { type: mongoose.Schema.Types.ObjectId, required: false, AUDIT: true}; 
        schemaDefinition.lastUpdateOn = { type: Date, required: false, AUDIT: true};
        schemaDefinition.lastUpdateBy = { type: mongoose.Schema.Types.ObjectId, required: false, AUDIT: true}; 
    }
    
    schemaDefinition.deletedOn = { type: Date, required: false, INTERNAL: true }; //This has the 
    //"INTERNAL" attribute. Used only on the "soft deletion" feature.

    return schemaDefinition;
}

/**
 * This method preprocess the JSON that will be delivered to the client for the following purposes:
 *   - Remove attributes marked as "INTERNAL" in the schema definition.
 * @param {*} model Entity model
 */
export function preProcessJSON(model: any) {
    let obj = model.toObject();

    //If an entity property had the "hidden" attribute with value "true", that 
    //property need to be removed from the JSON:
    Object.getOwnPropertyNames(model.schema.obj).forEach((prop) => {
        if (model.schema.obj[prop].INTERNAL) {
            delete obj[prop];
        }
    });

    return obj;
}
