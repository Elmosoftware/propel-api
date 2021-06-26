import dotenv from "dotenv"

import { ObjectPoolOptions } from "../core/object-pool-options";
import { ImpersonateOptions } from "../core/impersonate-options";

export enum LogLevel {
    Error = "ERROR",
    Info = "INFO",
    Debug = "DEBUG"
}

/**
 * Unified access to the API configuration.
 */
class Config {

    private _impersonateOptions: ImpersonateOptions;

    constructor() {
        dotenv.config();
        this._impersonateOptions = new ImpersonateOptions(process.env);
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
     * Returns the impersonate options configured.
     * This options can allow to execute remote scripts with specific credentials.
     */
    get impersonateOptions(): ImpersonateOptions {
        return this._impersonateOptions;
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