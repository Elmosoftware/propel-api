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

        this.models = []
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
        if (this._started) {
            throw new Error("Database has been already started.")
        }

        this._initModels();
        logger.logInfo("Establishing database conection...");
        return mongoose.connect(cfg.databaseEndpoint, mongooseOptions);
    }

    getService(modelName) {
        return new DataService(this._getModelByName(modelName));
    }

    _getModelByName(modelName) {
        let ret = null

        if (modelName && typeof modelName == "string") {

            ret = this.models.find((model) => {
                return model.name.toLowerCase() == modelName.toLowerCase();
            })

            if (!ret) {
                throw new Error(`There is no model named "${modelName}".`)    
            } 
        }
        else{
            throw new Error(`Parameter "modelName" is not from the expected type. Expected type "string" received type "${typeof modelName}".`);
        }

        return ret;
    }

    _initModels() {
        if (this.models && this.models.length == 0) {
            logger.logInfo("Initializing database models ...")

            try {
                fs.readdirSync(cfg.modelsFolder).forEach((file) => {
                    if (file.toLowerCase().endsWith(".js")) {
                        let m = require(`../${cfg.modelsFolder}/${path.basename(file, ".js")}`);
                        this.models.push(new EntityModel(m));
                    }
                })
            } catch (error) {
                logger.logError(`There was an error initializing database models, 
process will be aborted. Error details: \n${String(error)}.`)
                throw error
            }
        }
        else{
            logger.logInfo(`Database models has been initialized already.`)
        }

        logger.logInfo(`Database models initialization process finished successfully. Models found: ${this.models.length}.`)
    }
}

class EntityModel{
    constructor(model){
        this.repository = model; //.model;
        this.schema = model.schema.tree;
        this.name = model.modelName;
        this.pluralName = model.collection.collectionName;
    }
}

module.exports = new Database();
