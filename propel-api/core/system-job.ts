/**
 * Maximum amount of allowed entries per system job log.
 */
export const MAX_LOG_ENTRIES: number = 500

/**
 * Units of time used for the System jobs execution cycles.
 */
export enum SystemJobUnits {
    Seconds = "Seconds",
    Minutes = "Minutes",
    Hours = "Hours",
    Days = "Days"
}

/**
 * System Jobs log entry.
 */
export type SystemJobLogEntry = { ts: Date, msg: string, isError: boolean}

/**
 * System Job interface.
 */
export interface SystemJob {
    /**
     * Name of the System job.
     */
    readonly name: string;

    /**
     * Brief description of the System Job.
     */
    readonly description: string;

    /**
     * Time unit of the execution cycle. 
     * e.g.: Days, Hours, Minutes, etc.
     */
    readonly unit: SystemJobUnits;

    /**
     * Time amount of the execution cycle.
     * e.g.: How many units of time of the unit time selected in the attribute _"unit"_.
     */
    readonly every: number;

    /**
     * Boolean value that indicates if the first run of the job will occur as soon the job starts.
     * Otherwise, the first run will occur on the first cycle.
     * @example
     *                          every/unit  Job start at    First run   Next run
     * ==========================================================================================
     * runImmediately == false  1 Minutes   10:15:23        ~10:16:00   ~10:17:00
     * runImmediately == true   1 Minutes   10:15:23        ~10:15:23   ~10:16:00
     */
    readonly runImmediately: boolean;

    /**
     * This method will be called when the cycle is completed.
     * We can return back nothing or one or more log entries.
     */
    command(): SystemJobLogEntry | SystemJobLogEntry[] | undefined | 
        Promise<SystemJobLogEntry | SystemJobLogEntry[] | undefined>;
}
