// @ts-check
import { GraphSeries } from "./graph-series";

/**
 * Object Pool event stats.
 * Represents the usage statistics of object pool.
 */
export class ObjectPoolEventStats {

    /**
     * Indicates how fresh are our stats.
     */
    public statsTimestamp: Date = new Date();

    /**
     * Total amount of events in the period.
     */
    public totalEvents: number = 0;

    /**
     * Maximum amount of locked objects in a single point in time.
     */
    public maxLockedObjects: number = 0

    /**
     * Total ampount of overflow errors in the selected period.
     */
    public totalOverflowErrors: number = 0

    /**
     * Contains the stats of usage of the objects in the pool.
     */
    public objectPoolUsage: GraphSeries[] = [];

    /**
     * Contain the stats of the internal queued request for the pool service.
     */
    public objectPoolQueue: GraphSeries[] = [];

    /**
     * Contain the stats of the overflow queue errors per day.
     */
    public objectPoolQueueOverflow: GraphSeries[] = [];
    
    /**
     * Contain the totals per requested period.
     */
    public totals: GraphSeries[] = [];

    constructor() {
        
    }
}
