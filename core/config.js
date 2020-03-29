
const configValidator = require("./config-validator");

class Config {

    constructor() {

    }

    get validator() {
        return configValidator;
    }

    get environment() {
        return process.env.NODE_ENV;
    }

    get isProduction() {
        return process.env.NODE_ENV == "production";
    }

    get port() {
        return process.env.PORT;
    }

    get databaseEndpoint() {
        return process.env.DB_ENDPOINT;
    }

    get modelsFolder() {
        return process.env.MODELS_FOLDER
    }

}

module.exports = new Config();