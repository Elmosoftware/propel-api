const cfg = require("./config")
const Utils = require("../util/utils")
const logger = require("../services/logger-service");
const APIError = require("./api-error");

class ModelRepository {

    constructor(models = null) {
        this._models = [];
        this._generate(models);
    }

    get models() {
        return this._models;
    }

    getModelByName(modelName) {
        let ret = null

        if (modelName && typeof modelName == "string") {

            ret = this.models.find((model) => {
                return model.name.toLowerCase() == modelName.toLowerCase();
            })

            if (!ret) {
                throw new Error(`There is no model named "${modelName}".`)
            }
        }
        else {
            throw new Error(`Parameter "modelName" is not from the expected type. Expected type "string" received type "${typeof modelName}".`);
        }

        return ret;
    }

    _generate(models) {

        if (models && Array.isArray(models)) {
            logger.logInfo("Initializing database models ...")
            this._models = models;
            this._fillPopulateSchemas();

            if (!cfg.isProduction) {
                console.log("\n --------------- MODELS --------------- ")
                this.models.forEach(model => {
                    console.log(`"${model.name}":\n    
                Schema:${JSON.stringify(model.schema)}\n    
                Sub docs populate schema:${JSON.stringify(model.populateSchema)}`);
                });
            }
            logger.logInfo(`\nDatabase models initialization process finished 
            successfully. Models found: ${this.models.length}.`)
        }
        else {
            throw new APIError(`Database models initialization failed. The parameter "models" is a 
            null reference or is not an Array`);
        }
    }

    _fillPopulateSchemas() {

        this.models.forEach(model => {
            model.populateSchema = Utils.defaultIfEmptyObject(Object.assign({},
                this._recursivePopulateSchemas(model)), "");
        });
    }

    _recursivePopulateSchemas(parentModel, childModel = null) {

        let m = (!childModel) ? parentModel : childModel
        let populateSchema = {};

        for (var key in m.schema) {

            if (this._isRefField(m.schema[key])) {
                //We add a path for the reference property that need to be populated.
                if (populateSchema.path) {
                    populateSchema.path += ` ${key}`
                }
                else {
                    populateSchema.path = key
                }

                //We need to add all the populate references for childs too!
                let child = this.getModelByName(this._getRefFieldModelName(m.schema[key]));
                let populate = Object.assign({}, this._recursivePopulateSchemas(m, child));

                //If the child has at least one references, we will add those to the parent:
                if (!Utils.isEmptyObject(populate)) {
                    populateSchema.populate = populate;
                }
            }
        }
        return populateSchema;
    }

    _isRefField(schemaProperty) {

        let ret = false;

        if (Array.isArray(schemaProperty)) {
            if (schemaProperty.length > 0) {
                ret = Boolean(schemaProperty[0].ref)
            }
        }
        else {
            ret = Boolean(schemaProperty.ref);
        }

        return ret;
    }

    _getRefFieldModelName(schemaProperty) {

        let ret = null;

        if (this._isRefField(schemaProperty)) {
            if (Array.isArray(schemaProperty)) {
                ret = schemaProperty[0].ref;
            }
            else {
                ret = schemaProperty.ref;
            }
        }

        return ret;
    }
}

class EntityModel {
    constructor(model) {
        this.repository = model;
        this.schema = model.schema.tree;
        this.name = model.modelName;
        this.pluralName = model.collection.collectionName;
        this.populateSchema = null
    }
}

module.exports = { ModelRepository, EntityModel }
