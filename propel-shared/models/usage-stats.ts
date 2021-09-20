// @ts-check
import { GraphSeries } from "./graph-series";
import { GraphSeriesData } from "./graph-series-data";

/**
 * Propel application usage stats.
 * Represents the usage statistics of the app, this include the amount of items created, the 
 * most used items, amount of execution in a period of time, etc...
 */
export class UsageStats {

    /**
     * Indicates how fresh are our stats.
     */
    statsTimestamp: Date = new Date();

    /**
     * Total amount of executions in the current period.
     */
    public totalExecutions: number = 0;

    /**
     * Total of Workflows defined in the app.
     */
    public totalWorkflows: number = 0;

	/**
     * Total of Targets created.
     */
    public totaltargets: number = 0;
	
    /**
     * Amount of scripts uploaded in Propel.
     */
    public totalScripts: number = 0;
	
    /**
     * Total amount of Credentials Propel is keeping safe.
     */
    public totalCredentials: number = 0;

    /**
     * Contains the stats of all the executions in the current period.
     */
    public dailyExecutions: GraphSeries[] = [];

    /**
     * A collection of the most used workflows in the current period of time.
     */
    public mostUsedWorkflows: GraphSeriesData[] = [];
    
    /**
     * A detail of the latest executions.
     */
    public latestExecutions: GraphSeriesData[] = [];
    
    /**
     * A detail of the latest errors during executions.
     */
    public lastExecutionErrors: GraphSeriesData[] = [];

    constructor() {
        
    }
}
