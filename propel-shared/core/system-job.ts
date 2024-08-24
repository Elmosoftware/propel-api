import { PropelError } from "./propel-error";

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
// export type SystemJobLogEntry = { ts: Date, msg: string, isError: boolean}

/**
 * Represents a log entry for any System Job execution.
 */
export class SystemJobLogEntry {
    
    /**
     * Timestamp to the millisecond of when the log was created.
     */
    ts: Date;
    
    /**
     * Log message. If the entry is for an error it will have all the error details.
     */
    msg: string;
    
    /**
     * Boolean value indicating if the entry is an error.
     */
    isError: boolean;

    /**
     * Contructor for the System job log entry class.
     * @param msg Message/Error to log
     * @param treatAsError Optional value forcing to treat the message in one particular way. 
     * If not indicated and if _"msg"_ is of type *"string"* it will be false. But otherwise will be true. 
     */
    constructor(msg: string | Error | PropelError, treatAsError: boolean | undefined = undefined) {
        this.ts = new Date();
        this.msg = this.parseMsg(msg)

        if (typeof msg == "string") {
            this.isError = (treatAsError === undefined) ? false : treatAsError;
        }
        else {
            this.isError = true
        }
    }

    private parseMsg(msg: any): string {
        let ret: string = "";

        if (!msg) return ret;
        if(typeof msg =="string") return msg;
        if (typeof msg == "object") {
            Object.getOwnPropertyNames(msg)
                .sort((a, b) => a.localeCompare(b))
                .forEach((prop) => {
                    ret += `- ${prop}: ${msg[prop].toString()}\r\n`
                })
        }

        return ret;
    }

}

/**
 * Statistics for System jobs execution.
 */
export type SystemJobStats = { 
    successful: number, 
    errors: number
}

/**
 * Logs and stats for a System job.
 */
export class SystemJobLogs {
    logs: SystemJobLogEntry[] = [];
    stats: SystemJobStats = { 
        successful: 0,
        errors: 0 
    }    
}

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
