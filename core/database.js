// @ts-check
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
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
const { ModelRepository, EntityModel } = require("./model-repository")
const logger = require("../services/logger-service");
const { DataService } = require("../services/data-service");

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
                    models.push(new EntityModel(m));
                }
            });
            this._initRepository(models);
        } catch (error) {
            logger.logError(`There was an error initializing database models, 
process will be aborted. Error details: \n${String(error)}.`)
            throw error
        }

        logger.logInfo("Establishing database conection...");
        return mongoose.connect(cfg.databaseEndpoint, mongooseOptions);
    }

    getService(modelName) {
        return new DataService(this._modelRepository.getModelByName(modelName));
    }

    _initRepository(models) {
        this._modelRepository = new ModelRepository(models);
    }
}

module.exports = new Database();