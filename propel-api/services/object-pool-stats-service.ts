import { db } from "../core/database";
import { DataService } from "../services/data-service";
import { QueryModifier } from "../../propel-shared/core/query-modifier";
import { GraphSeries } from "../../propel-shared/models/graph-series";
import { GraphSeriesData } from "../../propel-shared/models/graph-series-data";
import { logger } from "./logger-service";
import { PagedResponse } from "../../propel-shared/core/paged-response";
import { ObjectPoolEventStats } from "../../propel-shared/models/object-pool-event-stats";
import { ObjectPoolEvent } from "../../propel-shared/models/object-pool-event";
import { SharedSystemHelper } from "../../propel-shared/utils/shared-system-helper";
import { SecurityToken } from "../../propel-shared/core/security-token";

/**
 * Service to generate Object pool stats.
 */
export class ObjectPoolStatsService {

    constructor() {

    }

    async getStats(token: SecurityToken): Promise<ObjectPoolEventStats> {
        let stats: ObjectPoolEventStats;
        let events: ObjectPoolEvent[];

        let totalsSeries: GraphSeries = new GraphSeries("Object Pool Max Size")
        let maxSizeSeries: GraphSeries = new GraphSeries("Object Pool Max Size")
        let objCreatedSeries: GraphSeries = new GraphSeries("Object Pool Total Objects")
        let objInUseSeries: GraphSeries = new GraphSeries("Object Pool Objects in use")
        let queueMaxSizeSeries: GraphSeries = new GraphSeries("Queue max size")
        let queuedRequestsSeries: GraphSeries = new GraphSeries("Queued requests")
        let queueOverflowSeries: GraphSeries = new GraphSeries("Queue Overflow errors")
  
        try {
            stats = new ObjectPoolEventStats()
            events = await this.getEvents(token);

            let dailyOverflowErrors: number = 0
            let lastTSDay: string = "";

            events.forEach((ev) => {
                let ts: string = SharedSystemHelper.formatDate(ev.timestamp, "LLL dd HH:mm:ss")
                let tsDay: string = SharedSystemHelper.formatDate(ev.timestamp, "D")

                if (lastTSDay == "") {
                    lastTSDay = tsDay
                }
                
                maxSizeSeries.series.push(new GraphSeriesData(ts, ev.poolSizeLimit))
                objCreatedSeries.series.push(new GraphSeriesData(ts, ev.totalObjects))
                objInUseSeries.series.push(new GraphSeriesData(ts, ev.lockedObjects))
                stats.maxLockedObjects = Math.max(stats.maxLockedObjects, ev.lockedObjects)
                
                queueMaxSizeSeries.series.push(new GraphSeriesData(ts, ev.queueSizeLimit))
                queuedRequestsSeries.series.push(new GraphSeriesData(ts, ev.queuedRequests))

                if (lastTSDay !== tsDay) {
                    queueOverflowSeries.series.push(new GraphSeriesData(lastTSDay, dailyOverflowErrors))
                    dailyOverflowErrors = 0
                    lastTSDay = tsDay
                }
                
                dailyOverflowErrors += ev.queueOverflowError
                stats.totalOverflowErrors += ev.queueOverflowError
            })

            queueOverflowSeries.series.push(new GraphSeriesData(lastTSDay, dailyOverflowErrors))
            stats.totalEvents = events.length;

            //Adding totals:
            totalsSeries.series.push(new GraphSeriesData("Total events", stats.totalEvents))
            totalsSeries.series.push(new GraphSeriesData("MAX Objects in use", stats.maxLockedObjects))
            totalsSeries.series.push(new GraphSeriesData("Queue overflow errors", stats.totalOverflowErrors))
        
            stats.objectPoolUsage = [maxSizeSeries, objCreatedSeries, objInUseSeries]
            stats.objectPoolQueue = [queueMaxSizeSeries, queuedRequestsSeries]
            stats.objectPoolQueueOverflow = [ queueOverflowSeries ]
            stats.totals = [ totalsSeries ]
        } catch (error) {
            logger.logWarn(`Update stats operation finished with error.`)
            throw error;
        }

        return stats
    }

    
    private async getEvents(token: SecurityToken): Promise<ObjectPoolEvent[]> {

        let svc: DataService = db.getService("ObjectPoolEvent", token)
        let qm = new QueryModifier();
        let result: PagedResponse<ObjectPoolEvent>

        qm.sortBy = "timestamp";
        
        result = await svc.find(qm) as PagedResponse<ObjectPoolEvent>;
        return Promise.resolve(result.data);
    }
}

export let objectPoolStatsService = new ObjectPoolStatsService();