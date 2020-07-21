import dotenv from "dotenv"

import { ObjectPoolOptions } from "./object-pool";

/**
 * Unified access to the API configuration.
 */
class Config {

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
     * Returns the current pool options configured for the API.
     */
    get poolOptions(): ObjectPoolOptions {
        let o = new ObjectPoolOptions();
        o.maxSize = Number(process.env.POOL_MAX_SIZE);
        o.preallocatedSize = Number(process.env.POOL_PRE_ALLOC)
        o.maxQueueSize = Number(process.env.POOL_QUEUE_SIZE)
        return o;
    }
}

export let cfg = new Config();