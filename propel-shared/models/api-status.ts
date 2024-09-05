export class APIStatus {

    /**
     * Environment name where Porpel is running.
     */
    environmentName!: string;

    /**
     * Logging level set.
     */
    loggingLevel!: string;
    /**
     * Log name
     */
    logName!: string;

    /**
     * Log source
     */
    logSource!: string;

    /**
     * Propel object pool options.
     */
    poolOptions!: any;

    /**
     * Propel object pool stats.
     */
    poolStats!: any;

    /**
     * Indicates if the Workflow Schedules feature is enabled in the API.
     */
    workflowSchedulesEnabled!: boolean

    constructor() {
    
    }
}