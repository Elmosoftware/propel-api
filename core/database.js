// @ts-check

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
const logger = require("../services/logger-service");

/**
 * This class provides the database initialization setup.
 */
class Database {

    constructor() {

        //Adding specific Mongo DB driver connection options for Prod:
        if (process.env.NODE_ENV == "production") {
            mongooseOptions.autoCreate = false;
            mongooseOptions.autoIndex = false;
        }
    }

    /**
     * Establish database connectivity and report errors if any.
     */
    connect() {
        //Establishing database conection:
        mongoose.connect(process.env.DB_ENDPOINT, mongooseOptions, (err) => {
            if (err) {
                logger.logError("There was an error connecting to Mongo DB instance. Error description:\n" + err);
                throw err
            }

            logger.logInfo(`Successfully connected to Mongo DB instance!
Connection options in use:\n${JSON.stringify(mongooseOptions)
                    .replace(/,/g, "\n")
                    .replace(/{/g, "")
                    .replace(/}/g, "")}\n`)
        });
    }
}

module.exports = new Database();
