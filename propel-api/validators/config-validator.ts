//@ts-check
import { ValidatorBase } from "../../propel-shared/validators/validator-base";

/**
 * This  class provides a method to validate .env config file.
 * @extends ValidatorBase
 */
class ConfigValidator extends ValidatorBase {

    private readonly MIN_PORT: number;
    private readonly MAX_PORT: number;

    constructor() {
        super();
        this.MIN_PORT = 1024;
        this.MAX_PORT = 49151;
    }

    /**
     * Validates the .env Config file after been loaded.
     */
    validate(): ConfigValidator {
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

        //PS_SCRIPT_PROPEL_PARAM is required and can't be null or empty:
        if (!process.env.PS_SCRIPT_PROPEL_PARAM) {
            super._addError("PS_SCRIPT_PROPEL_PARAM is required and can't be null or empty.");
        }

        if (!process.env.POOL_MAX_SIZE) {
            super._addError("POOL_MAX_SIZE is required.");
        }
        else if ((isNaN(Number(process.env.POOL_MAX_SIZE)) || Number(process.env.POOL_MAX_SIZE) < 0)) {
            super._addError(`POOL_MAX_SIZE is not a number or is less than zero. Supplied value: "${process.env.POOL_MAX_SIZE}".`);
        }

        if (!process.env.POOL_PRE_ALLOC) {
            super._addError("POOL_PRE_ALLOC is required.");
        }
        else if ((isNaN(Number(process.env.POOL_PRE_ALLOC)) || Number(process.env.POOL_PRE_ALLOC) < 0 || Number(process.env.POOL_PRE_ALLOC) > Number(process.env.POOL_MAX_SIZE))) {
            super._addError(`POOL_PRE_ALLOC is not a number, is less than zero or greater to POOL_MAX_SIZE. Supplied value: "${process.env.POOL_PRE_ALLOC}".`);
        }

        if (!process.env.POOL_QUEUE_SIZE) {
            super._addError("POOL_QUEUE_SIZE is required.");
        }
        else if ((isNaN(Number(process.env.POOL_QUEUE_SIZE)) || Number(process.env.POOL_QUEUE_SIZE) < 0)) {
            super._addError(`POOL_QUEUE_SIZE is not a number or is less than zero. Supplied value: "${process.env.POOL_QUEUE_SIZE}".`);
        }

        if (!process.env.MAX_WORKFLOW_RESULTS_SIZE) {
            super._addError("MAX_WORKFLOW_RESULTS_SIZE is required.");
        }
        else if ((isNaN(Number(process.env.MAX_WORKFLOW_RESULTS_SIZE)) || Number(process.env.MAX_WORKFLOW_RESULTS_SIZE) < 0)) {
            super._addError(`MAX_WORKFLOW_RESULTS_SIZE is not a number or it has a negative value. Supplied value: "${process.env.MAX_WORKFLOW_RESULTS_SIZE}".`);
        }

        //IMPERSONATE can't be null and must be a Boolean value
        if (!process.env.IMPERSONATE) {
            super._addError("IMPERSONATE is required.");
        }
        else if (!(process.env.IMPERSONATE =="true" || process.env.IMPERSONATE =="false")) {
            super._addError(`IMPERSONATE need to be a boolean value. Supplied value: "${process.env.IMPERSONATE}".`);
        }

        //IMPERSONATE_USER can't be null if IMPERSONATE is set to true:
        if (!process.env.IMPERSONATE_USER && process.env.IMPERSONATE !== "false" ) {
            super._addError(`IMPERSONATE_USER can be empty only if IMPERSONATE is set to "false".`);
        }

        return this;
    }
}

export let cfgVal = new ConfigValidator();