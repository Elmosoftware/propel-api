// @ts-check
import mongoose from "mongoose";

//Core Propel API services and helpers:
import { cfg } from "./config";
import { logger } from "../services/logger-service";
import { schemaRepo } from "../../propel-shared/schema/schema-repository";
import { MongooseSchemaAdapter, AdapterModel } from "../schema/mongoose-schema-adapter";
import { DataService } from "../services/data-service";
import { PropelError } from "../../propel-shared/core/propel-error";
import { SchemaDefinition } from "../../propel-shared/schema/schema-definition";

const mongooseOptions: any = {
    useNewUrlParser: true, //(node:61064) DeprecationWarning: current URL string parser is deprecated.
    useCreateIndex: true, //(node:61064) DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
    //After migration to v5.7.7 we are adding the following to avoid other deprecation warnings 
    //as stated in https://mongoosejs.com/docs/deprecations.html:
    useFindAndModify: false,
    useUnifiedTopology: true,
    autoCreate: false, //Recall to create the collections manually!
    autoIndex: false //and indexes too :-)
};

/**
 * This class provides the database initialization setup.
 */
class Database {

    private _modelsRepo: AdapterModel[];
    private _started: boolean = false;

    constructor() {
        let adapter = new MongooseSchemaAdapter();
        this._modelsRepo = [];

        if (schemaRepo.count > 0) {
            //Converting all the schemas to Mongoose models:
            schemaRepo.entitySchemas.forEach((schema: Readonly<SchemaDefinition>) => {
                this._modelsRepo.push(adapter.asModel(schema));
            })
        }
        else {
            throw new PropelError(`Repository has no schemas defined!`);
        }
    }

    /**
     * Readonly options set for the database connection.
     */
    get options() {
        return mongooseOptions;
    }

    /**
     * returns a readonly boolean value indicating if the Database have been already initialized. 
     */
    get started() {
        return this._started;
    }

    /**
     * Built models and establish database connectivity.
     */
    start() {
        let models: any[] = [];

        if (this._started) {
            throw new PropelError("Database have been already started.")
        }

        if (!cfg.isProduction) {
            this._printDetails();
        }

        logger.logInfo("Establishing database conection...");
        return mongoose.connect(cfg.databaseEndpoint, mongooseOptions);
    }

    /**
     * Returns a DataService instance that allows to interact with the specified 
     * model by adding, modifying, removing and searching documents.
     * @param {string} modelName Model name to serve
     */
    getService(modelName: string) {
        return new DataService(this._getModelByName(modelName));
    }

    _getModelByName(modelName: string): AdapterModel {
        let ret = null

        if (modelName && typeof modelName == "string") {

            ret = this._modelsRepo.find((model: AdapterModel) => {
                return model.name.toLowerCase() == modelName.toLowerCase();
            })

            if (!ret) {
                throw new PropelError(`There is no model named "${modelName}".`)
            }
        }
        else {
            throw new Error(`Parameter "modelName" is an empty string or is not from the expected type. Expected type "string" received type "${typeof modelName}", received value "${modelName}".`);
        }

        return ret;
    }

    _printDetails() {
        let details: string = ""
        logger.logInfo(`\r\nModels initialized sucessfully. Models count: ${this._modelsRepo.length}.`);

        details = "\r\n --------------- MODELS --------------- "
        this._modelsRepo.forEach((model: AdapterModel) => {
            details += `\r\n- ${model.name}:\r\n`;
            let fieldslist: string = "";
            //@ts-ignore
            for (var key in model.model.schema.tree) {
                if (fieldslist != "") {
                    fieldslist += ", "
                }
                fieldslist += key
            }
            details += `\tFields:${fieldslist}
\tSub docs populate schema:${JSON.stringify(model.populateSchema)}
\tInternal fields: ${model.internalFieldsList.join(", ")}
\tAudit fields: ${model.auditFieldsList.join(", ")}
---------------------------------------------------------------------\r\n`;            
        });
        
        logger.logDebug(details);
    }
}

export let db = new Database();