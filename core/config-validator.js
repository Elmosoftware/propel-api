//@ts-check

const ValidatorBase = require("../util/validator-base");

/**
 * This  class provides a method to validate .env config file.
 * @extends ValidatorBase
 */
class ConfigValidator extends ValidatorBase {

    constructor() {
        super();
        this.MIN_PORT = 1024;
        this.MAX_PORT = 49151;
    }

    /**
     * Validates the .env Config file after been loaded.
     */
    validateConfig() {

        let validEnvValues = ["development", "production"];

        //NODE_ENV is required and can be only one of the following values "dev", "prod":
        if (!process.env.NODE_ENV || !validEnvValues.includes(process.env.NODE_ENV)) {
            super._addError(`NODE_ENV is missing or it has an invalid value.
            Current value is: "${(process.env.NODE_ENV) ? process.env.NODE_ENV : "null or undefined"}".
            Possible values are: ${validEnvValues.join(", ")}.`);
        }

        /*
            Port is required and must be one of the available registered TCP port numbers. TCP port numbers are:
                
                - Well-known ports range from 0 through 1023.
                - Registered ports are 1024 to 49151.
                - Dynamic ports (also called private ports) are 49152 to 65535.
        */
        if (!process.env.PORT) {
            super._addError("PORT is required.");
        }
        else if ((isNaN(Number(process.env.PORT)) || Number(process.env.PORT) < this.MIN_PORT ||
            Number(process.env.PORT) > this.MAX_PORT)) {
            super._addError(`PORT is not a number or is out of the range of valid TCP registered ports, (${this.MIN_PORT} to ${this.MAX_PORT}).`);
        }

        //DB_ENDPOINT is required and can't be null or empty:
        if (!process.env.DB_ENDPOINT) {
            super._addError("DB_ENDPOINT is required and can't be null or empty.");
        }

        return this;
    }
}

module.exports = new ConfigValidator();
