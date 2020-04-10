// @ts-check
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { buildSchema } = require("graphql");

const mongooseOptions = {
    useNewUrlParser: true, //(node:61064) DeprecationWarning: current URL string parser is deprecated.
    useCreateIndex: true, //(node:61064) DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead.
    //After migration to v5.7.7 we are adding the following to avoid other deprecation warnings 
    //as stated in https://mongoosejs.com/docs/deprecations.html:
    useFindAndModify: false,
    useUnifiedTopology: true
};

//Core Propel API services and helpers:
const cfg = require("./config")
const ModelRepository = require("./model-repository")
const logger = require("../services/logger-service");
const DataService = require("../services/data-service");

/**
 * This class provides the database initialization setup.
 */
class Database {

    constructor() {

        //Adding specific Mongo DB driver connection options for Prod:
        if (cfg.isProduction) {
            mongooseOptions.autoCreate = false;
            mongooseOptions.autoIndex = false;
        }

        this._modelRepository = null;
        this._started = false;
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

        let models = [];

        if (this._started) {
            throw new Error("Database has been already started.")
        }

        try {
            logger.logInfo(`Getting models from folder "${cfg.modelsFolder}" ...`);

            fs.readdirSync(cfg.modelsFolder).forEach((file) => {
                if (file.toLowerCase().endsWith(".js")) {
                    let m = require(`../${cfg.modelsFolder}/${path.basename(file, ".js")}`);
                    models.push(m);
                }
            });

            logger.logInfo("Initializing database models ...")
            this._modelRepository = new ModelRepository(models);
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
    getService(modelName) {
        return new DataService(this._modelRepository.getModelByName(modelName));
    }

    /**
     * Returs the schema inferred from the model.
     */
    getGraphQLSchema() {
        return buildSchema(this._modelRepository.getGraphQLSchema());
    }
}

module.exports = new Database();