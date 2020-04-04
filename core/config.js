
// const configValidator = require("../validators/config-validator");

/**
 * Unified access to the API configuration.
 */
class Config {

    constructor() {
    }

    /**
     * Current environment name.
     */
    get environment() {
        return process.env.NODE_ENV;
    }

    /**
     * Returns a boolean value indicating if current configuration relates to production environment.
     */
    get isProduction() {
        return process.env.NODE_ENV == "production";
    }

    /**
     * Port in which the API is listening
     */
    get port() {
        return process.env.PORT;
    }

    /**
     * Database endpoint
     */
    get databaseEndpoint() {
        return process.env.DB_ENDPOINT;
    }

    /**
     * Location of the "models" folder used during API initialization process. 
     */
    get modelsFolder() {
        return process.env.MODELS_FOLDER
    }
}

module.exports = new Config();