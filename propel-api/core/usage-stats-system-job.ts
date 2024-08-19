import { SystemJob, SystemJobUnits, SystemJobLogEntry } from "./system-job";
import { usageStatsService } from "../services/usage-stats-service";
import { cfg } from "./config";

/**
 * System job definition for the usage stats process.
 */
export class UsageStatsSystemJob implements SystemJob {
    readonly name: string = "Usage Stats";

    readonly description: string = "This job process the Propel usage stats we can see in Home page, like" + 
    " total amount of Workflows, scripts, top 5 executions, etc...";
    
    readonly unit: SystemJobUnits = SystemJobUnits.Minutes;
    
    readonly every: number = cfg.usageStatsStaleMinutes;
    
    readonly runImmediately: boolean = true;

    async command(): Promise<SystemJobLogEntry | SystemJobLogEntry[] | undefined> {
        await usageStatsService.updateStats()
        return
    }
}