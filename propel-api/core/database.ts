// @ts-check
import mongoose from "mongoose";
import { buildSchema } from "graphql";

//Core Propel API services and helpers:
import { cfg } from "./config";
import { allModels } from "../models/all-models";
import { ModelRepository } from "./model-repository";
import { logger } from "../../propel-shared/services/logger-service";
import { DataService } from "../services/data-service";
import { PropelError } from "../../propel-shared/core/propel-error";

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

    private _modelRepository: ModelRepository | null = null;
    private _started: boolean = false;

    constructor() {
    }

    /**
     * Readonly options set for the database connection.
     */
    get options() {
        return mongooseOptions;
    }

    /**
     * returns a readonly boolean value indicating if the Database has been already initialized. 
     */
    get started() {
        return this._started;
    }

    /**
     * Built models and establish database connectivity.
     */
    start() {

        let models: any[] = [];
        let filePath
        if (this._started) {
            throw new Error("Database has been already started.")
        }

        try {
            logger.logInfo("Initializing database models ...")
            this._modelRepository = new ModelRepository(allModels);
            logger.logInfo(`\nModels initialized sucessfully. Models found: ${this._modelRepository.count}.`);

            if (!cfg.isProduction) {
                console.log("\n --------------- MODELS --------------- ")
                this._modelRepository.models.forEach(model => {
                    console.log(`"${model.name}`);
                    console.log(`Fields:${model.fields.map((field) => { return field.name }).join(", ")}`);
                    console.log(`Sub docs populate schema:${JSON.stringify(model.populateSchema)}`);
                    console.log(`Internal fields: ${model.internalFields.join(", ")}`);
                    console.log(`Audit fields: ${model.auditFields.join(", ")}`);
                    console.log("-----------------------------------------")
                });

                console.log("\n --------------- SCHEMA --------------- ")
                console.log(this._modelRepository.getGraphQLSchema());
                console.log("-----------------------------------------")
                console.log("\n ------------- RESOLVERS ------------- ")
                let r = this._modelRepository.getGraphQLResolver();
                Object.getOwnPropertyNames(r)
                    .filter((method) => typeof r[method] === 'function')
                    .map((method) => {
                        let model = method
                            .replace(/^(insert)/, "")
                            .replace(/^(update)/, "")
                            .replace(/^(get)/, "")
                            .replace(/^(find)/, "")
                            .replace(/^(delete)/, "");
                        return `${model.toUpperCase()} -> ${method}`;
                    })
                    .sort()
                    .forEach((resolver) => {
                        console.log(resolver);
                    })
                console.log("-----------------------------------------\n")
            }
        } catch (error) {
            logger.logError(`There was an error initializing database models, 
process will be aborted. Error details: \n${String(error)}.`)
            throw error
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
        this._throwIfNoRepository();
        //@ts-ignore
        return new DataService(this._modelRepository.getModelByName(modelName));
    }

    /**
     * Returns the schema inferred from the model.
     */
    getGraphQLSchema() {
        this._throwIfNoRepository();
        //@ts-ignore
        return buildSchema(this._modelRepository?.getGraphQLSchema());
    }

    /**
     * Returns the Resolver object for all the Queries and Mutations in the model.
     */
    getGraphQLResolver(): any {
        this._throwIfNoRepository();
        //@ts-ignore
        return this._modelRepository?.getGraphQLResolver();
    }

    private _throwIfNoRepository(): void {
        if (!this._modelRepository) {
            throw new PropelError(`The model repository has not been initialized yet. Please call "Database.start()" first!`);
        }
    }
}

export let db = new Database();