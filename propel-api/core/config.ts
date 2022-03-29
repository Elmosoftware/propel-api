import dotenv from "dotenv"

import { ObjectPoolOptions } from "../core/object-pool-options";
import { SystemHelper } from "../util/system-helper";

export enum LogLevel {
    Error = "ERROR",
    Info = "INFO",
    Debug = "DEBUG"
}

/**
 * Unified access to the API configuration.
 */
class Config {

    private _key: string = "";

    constructor() {
        dotenv.config();
    }

    /**
     * Current environment name.
     */
    get environment(): string {
        return (process.env.NODE_ENV) ? process.env.NODE_ENV : "";
    }

    /**
     * Returns a boolean value indicating if current configuration relates to production environment.
     */
    get isProduction(): boolean {
        return process.env.NODE_ENV == "production";
    }

    /**
     * Port in which the API is listening
     */
    get port() : string {
        return (process.env.PORT) ? process.env.PORT : "";
    }

    /**
     * Database endpoint
     */
    get databaseEndpoint(): string {
        return (process.env.DB_ENDPOINT) ? process.env.DB_ENDPOINT : "";
    }

    /**
     * Returns the Service file system root folder.
     */
    get rootFolder(): string {
        return process.cwd();
    }

    /**
     * Returns the Powershell scripts folder name.
     */
    get PSScriptsFolder(): string {
        return (process.env.PS_SCRIPTS_FOLDER) ? process.env.PS_SCRIPTS_FOLDER : "";
    }

    /**
     * Returns the Powershell scripts system parameter managed by Propel. This parameter allows 
     * to get some context information inside the executed script.
     */
    get PSScriptPropelParam(): string {
        return (process.env.PS_SCRIPT_PROPEL_PARAM) ? process.env.PS_SCRIPT_PROPEL_PARAM : "";
    }

    /**
     * Returns the current pool options configured for the API.
     */
    get poolOptions(): ObjectPoolOptions {
        let o = new ObjectPoolOptions();
        o.maxSize = Number(process.env.POOL_MAX_SIZE);
        o.preallocatedSize = Number(process.env.POOL_PRE_ALLOC)
        o.maxQueueSize = Number(process.env.POOL_QUEUE_SIZE)
        return o;
    }

    /**
     * This is the log name for logging into Windows Event log, (Production only).
     */
    get logName(): string {
        return (process.env.LOGGING_LOG_NAME) ? process.env.LOGGING_LOG_NAME : "";
    }

    /**
     * This is the log source for logging into Windows Event log, (Production only).
     */
    get logSource(): string {
        return (process.env.LOGGING_SOURCE) ? process.env.LOGGING_SOURCE : "";
    }

    /**
     * This is the log level configured for the API.
     */
    get logLevel(): LogLevel {
        return (process.env.LOGGING_LEVEL) ? (process.env.LOGGING_LEVEL as LogLevel) : LogLevel.Error;
    }

    /**
     * There is a limitation on the amount of data wecan save as per document basis in Mongo DB. 
     * Because the execution log contains the data retrieved by all the targets included in the 
     * workflow, (and this can be a lot of data), we are establishing a maximum amoount data that 
     * we can admit on any Execution log entry.
     * 
     * Be aware that: Actual limit on Mongo DB is set to 16MB, so the recommendation is this limit 
     * is set no higher than 12MB in order to be able to report at least part of the execution 
     * results and detail the reason in the execution log.
     */
    get maxWorkflowResultsSize(): number {
        return Number(process.env.MAX_WORKFLOW_RESULTS_SIZE)
    }

    /**
     * Retrieves the max execution log size entry allowed in MB.
     */
    get maxWorkflowResultsSizeInMB(): number {
        return this.maxWorkflowResultsSize / 1024 / 1024
    }

    /**
     * This is the amount of days configured in the database to retain execution logs.
     * Execution Logs older wil be automatically eliminated from the database.
     * 
     * **IMPORTANT**: This need to be kept on sync with the expiration date set in 
     * the *"I_StartedAt"* index of *"ExecutionLogs"* collection.  
     */
    get executionLogRetentionDays(): number {
        return Number(process.env.EXECUTIONLOG_RETENTION_DAYS)
    }

    /**
     * Encryption key to be used in some database operations.
     */
    get encryptionKey(): string {
        if (!this._key) {
            this._key = SystemHelper.decodeBase64(String(process.env.ENCRYPTION_KEY));
        }
        
        return this._key; 
    }

    /**
     * Token expiration in minutes in zeit/ms format.
     * For more information: https://github.com/vercel/ms
     */
    get tokenExpiration(): string {
        return `${process.env.TOKEN_EXPIRATION_MINUTES}Min`; 
    }

    /**
     * Amount of minutes after the current application usage stats will be considered stale.
     */
    get usageStatsStaleMinutes(): number {
        return Number(process.env.USAGE_STATS_STALE_MINUTES);
    }

    /**
     * Maximum upload payload set for the API in Megabytes.
     */
    get uploadPayloadLimit(): string {
        let limit = Number(process.env.UPLOAD_PAYLOAD_LIMIT_MB);
        let ret = "100kb"; //The value "0" in the configuration means to set 
        //the default upload payload value that is 100KB.

        if (limit > 0) {
            ret = Number(process.env.UPLOAD_PAYLOAD_LIMIT_MB).toString() + "mb";
        }

        return ret;
    }

    /**
     * 
     * @param paramName Parameter name to check.
     * @returns A boolean value indicating if the parameter has the samae name defined 
     * for the "Propel" parameter.
     */
    isPropelParam(paramName: string): boolean {
        return (paramName.toLowerCase() == this.PSScriptPropelParam.toLowerCase());
    }
}

export let cfg = new Config();