//@ts-check
import { ValidatorBase } from "../../propel-shared/validators/validator-base";

/**
 * This  class provides a method to validate .env config file.
 * @extends ValidatorBase
 */
class ConfigValidator extends ValidatorBase {

    private readonly MIN_PORT: number;
    private readonly MAX_PORT: number;
    private readonly ENCRYPTION_KEY_LENGTH: number;

    constructor() {
        super();
        this.MIN_PORT = 1024;
        this.MAX_PORT = 49151;
        this.ENCRYPTION_KEY_LENGTH = 64
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

        if (!process.env.POOL_STATS) {
            super._addError("POOL_STATS is required.");
        }
        else if(!(String(process.env.POOL_STATS).toLowerCase() == "on" || String(process.env.POOL_STATS).toLowerCase() == "off")) {
            super._addError(`POOL_STATS possible values are "On" or "Off".`);
        }

        if (!process.env.MAX_WORKFLOW_RESULTS_SIZE) {
            super._addError("MAX_WORKFLOW_RESULTS_SIZE is required.");
        }
        else if ((isNaN(Number(process.env.MAX_WORKFLOW_RESULTS_SIZE)) || Number(process.env.MAX_WORKFLOW_RESULTS_SIZE) < 0)) {
            super._addError(`MAX_WORKFLOW_RESULTS_SIZE is not a number or it has a negative value. Supplied value: "${process.env.MAX_WORKFLOW_RESULTS_SIZE}".`);
        }

        //ENCRYPTION_KEY can't be null and need to have 64 characters length:
        if (!process.env.ENCRYPTION_KEY || String(process.env.ENCRYPTION_KEY).length !== this.ENCRYPTION_KEY_LENGTH) {
            super._addError(`ENCRYPTION_KEY is required and need to be 64 characters length.`);
        }
        else {
            if (!process.env.RUNTIME_TOKEN_KEY_LENGTH) {
                super._addError("RUNTIME_TOKEN_KEY_LENGTH is required.");
            }
            else if ((isNaN(Number(process.env.RUNTIME_TOKEN_KEY_LENGTH)) || Number(process.env.RUNTIME_TOKEN_KEY_LENGTH) <= 0 || Number(process.env.RUNTIME_TOKEN_KEY_LENGTH) > this.ENCRYPTION_KEY_LENGTH)) {
                super._addError(`RUNTIME_TOKEN_KEY_LENGTH is not a number or is less than zero or greater than ${this.ENCRYPTION_KEY_LENGTH}. Supplied value: "${process.env.RUNTIME_TOKEN_KEY_LENGTH}".`);
            }
            else {
                if (!process.env.RUNTIME_TOKEN_IV_LENGTH) {
                    super._addError("RUNTIME_TOKEN_IV_LENGTH is required.");
                }
                else if ((isNaN(Number(process.env.RUNTIME_TOKEN_IV_LENGTH)) || Number(process.env.RUNTIME_TOKEN_IV_LENGTH) <= 0 || Number(process.env.RUNTIME_TOKEN_IV_LENGTH) > Number(process.env.RUNTIME_TOKEN_KEY_LENGTH))) {
                    super._addError(`RUNTIME_TOKEN_IV_LENGTH is not a number or is less than zero or greater than the defined RUNTIME_TOKEN_KEY_LENGTH, (${process.env.RUNTIME_TOKEN_KEY_LENGTH} bytes). Supplied value: "${process.env.RUNTIME_TOKEN_IV_LENGTH}".`);
                }
            }
        }

        if (!process.env.RUNTIME_TOKEN_ALG) {
            super._addError(`RUNTIME_TOKEN_ALG is required.`);
        }

        if (!process.env.EXECUTIONLOG_RETENTION_DAYS) {
            super._addError("EXECUTIONLOG_RETENTION_DAYS is required.");
        }
        else if(isNaN(parseInt(String(process.env.EXECUTIONLOG_RETENTION_DAYS))) || Number(process.env.EXECUTIONLOG_RETENTION_DAYS) <= 0) {
            super._addError(`EXECUTIONLOG_RETENTION_DAYS is not a number or it has a value less or equal to zero. Supplied value: "${process.env.EXECUTIONLOG_RETENTION_DAYS}".`);
        }

        if (!process.env.USAGE_STATS_STALE_MINUTES) {
            super._addError("USAGE_STATS_STALE_MINUTES is required.");
        }
        else if(isNaN(parseInt(String(process.env.USAGE_STATS_STALE_MINUTES))) || Number(process.env.USAGE_STATS_STALE_MINUTES) < 0) {
            super._addError(`USAGE_STATS_STALE_MINUTES is not a number or it has a value less than zero. Supplied value: "${process.env.USAGE_STATS_STALE_MINUTES}".`);
        }

        if (!process.env.UPLOAD_PAYLOAD_LIMIT_MB) {
            super._addError("UPLOAD_PAYLOAD_LIMIT_MB is required.");
        }
        else if ((isNaN(Number(process.env.UPLOAD_PAYLOAD_LIMIT_MB)) || Number(process.env.UPLOAD_PAYLOAD_LIMIT_MB) < 0 || Number(process.env.UPLOAD_PAYLOAD_LIMIT_MB) > 100)) {
            super._addError(`UPLOAD_PAYLOAD_LIMIT_MB is not a number or is less than zero or higher than 100. Supplied value: "${process.env.UPLOAD_PAYLOAD_LIMIT_MB}".`);
        }

        if (!process.env.TOKEN_EXPIRATION_MINUTES) {
            super._addError("TOKEN_EXPIRATION_MINUTES is required.");
        }
        else if ((isNaN(Number(process.env.TOKEN_EXPIRATION_MINUTES)) || Number(process.env.TOKEN_EXPIRATION_MINUTES) < 0)) {
            super._addError(`TOKEN_EXPIRATION_MINUTES is not a number or is less than zero. Supplied value: "${process.env.TOKEN_EXPIRATION_MINUTES}".`);
        }

        if (!process.env.LEGACY_SECURITY) {
            super._addError("LEGACY_SECURITY is required.");
        }
        else if(!(String(process.env.LEGACY_SECURITY).toLowerCase() == "on" || String(process.env.LEGACY_SECURITY).toLowerCase() == "off")) {
            super._addError(`LEGACY_SECURITY possible values are "On" or "Off".`);
        }

        if (!process.env.WORKFLOW_SCHEDULES) {
            super._addError("WORKFLOW_SCHEDULES is required.");
        }
        else if(!(String(process.env.WORKFLOW_SCHEDULES).toLowerCase() == "on" || String(process.env.WORKFLOW_SCHEDULES).toLowerCase() == "off")) {
            super._addError(`WORKFLOW_SCHEDULES possible values are "On" or "Off".`);
        }

        return this;
    }
}

export let cfgVal = new ConfigValidator();