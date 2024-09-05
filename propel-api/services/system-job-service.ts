import { CronJob, CronJobParams } from "cron";
import { DateTime } from "luxon";

import { SystemJob, SystemJobUnits, SystemJobLogEntry, MAX_LOG_ENTRIES, SystemJobStats, SystemJobLogs } from "../../propel-shared/core/system-job";
import { PropelError } from "../../propel-shared/core/propel-error";
import { logger } from "./logger-service";
import { SharedSystemHelper } from "../../propel-shared/utils/shared-system-helper";

type Job = { sysJob: SystemJob, cronJob: CronJob, stats: SystemJobStats }

/**
 * This class manage all the System jobs by:
 * - Registering the jobs to run.
 * - Taking care of the jobs execution.
 * - Storing all the returned log entries.
 */
export class SystemJobService {
    private _jobs: Map<string, Job> = new Map<string, Job>()
    private _logs: Map<string, SystemJobLogEntry[]> = new Map<string, SystemJobLogEntry[]>();

    /**
     * Allows to add a job to manage.
     * @param job Job to register.
     * @throws An Error if the job is already registered.
     */
    register(job: SystemJob): void {
        let config: CronJobParams;
        let jobName:string = job.name;
        if (this.jobExists(job)) throw new PropelError(`The job "${jobName}" is already registered.`)

        config = {
            cronTime: this.buildCronExpression(job),
            onTick: () => { this.run(jobName) },
            start: false,
            runOnInit: false
        }

        let mappedJob: Job = { 
            sysJob: job,
            cronJob: CronJob.from(config),
            stats: {
                successful: 0,
                errors: 0
            }
        }    

        logger.logInfo(`Registering system job "${jobName}" ` + 
            `to run every ${job.every.toString()} ${job.unit.toString()}.`)
        this._jobs.set(jobName, mappedJob)
        
        if (job.runImmediately) {
            logger.logDebug(`The System job "${jobName}" is configured to run immediately. Starting first execution.`)
            this.run(jobName)
            .finally(() => {
                mappedJob.cronJob.start();
            })
        }
        else {
            mappedJob.cronJob.start();
        }
    }

    /**
     * Stop all registered jobs.
     */
    stopAllJobs(): void {
        this._jobs.forEach((job: Job) => {
            job.cronJob.stop();
        })
    }

    /**
     * Search for the 
     * @param job Job to search for.
     * @returns A boolean value indicatong if the job is already registered.
     */
    jobExists(job: SystemJob | string) : boolean {
        if (!job) return false;
        if (typeof job == "string") return this._jobs.has(job);
        if (job.name) return this._jobs.has(job.name);
        return false
    }

    /**
     * Returns all the registered jobs.
     * @returns All the SysJobs registered.
     */
    getJobs(): SystemJob[] {
        let ret: SystemJob[] = [];

        this._jobs.forEach((job: Job) => {
            ret.push(job.sysJob);
        })

        return ret;
    }

    /**
     * Returns a System job stats and logs if the job exists, otherwise it will return a null value.
     * @param jobName Name of the job whose stats and logs we want to get.
     * @returns A System Job stats and logs.
     */
    getJobLogs(jobName: string): SystemJobLogs | null {
        let job: Job;
        let ret: SystemJobLogs | null = null

        if (!this._jobs.has(jobName)) return ret;
        job = this._jobs.get(jobName)!;
        ret = new SystemJobLogs();
        ret.stats = job.stats;
        
        if (this._logs.has(jobName)) {
            ret.logs = this._logs.get(jobName)! 
        }
        else {
            ret.logs = [];
        }

        return ret;
    }

    /**
     * Return the next cycle execution for the specified System Job.
     * @param jobName Name of the job for whom to get the next execution.
     * @returns 
     */
    getJobNextExecution(jobName: string): Date | null {
        if (!this._jobs.has(jobName)) return null;
        else return this._jobs.get(jobName)!.cronJob.nextDate().toJSDate();
    }

    private async run(jobName: string) {
        let job = this._jobs.get(jobName)
        let startTime: Date;
        let logs: SystemJobLogEntry[] = [];
        let jobLogs: SystemJobLogEntry | SystemJobLogEntry[] | undefined;
        
        if (!job) {
            throw new PropelError(`The job with name "${jobName}" wasn't found ` + 
                `in the internal jobs list in the SystemJobService at the moment of run.`)
        }

        try {
            logger.logDebug(`Starting system job "${jobName}" execution.`)
            logs.push(new SystemJobLogEntry(`JOB START`))
            startTime = new Date()
            
            jobLogs = await job.sysJob.command();

            if (jobLogs) {
                if (Array.isArray(jobLogs)) {
                    logs.push(...jobLogs)
                }
                else {
                    logs.push(jobLogs)
                }
            }

            job.stats.successful += 1
            logs.push(new SystemJobLogEntry(`JOB END [Duration: ${SharedSystemHelper.getDuration(startTime, new Date(), "hh:mm:ss.SSS")}]`))
            logger.logDebug(`Execution of system job "${jobName}" finished succesfully.`)
        } catch (error: any) {
            logger.logDebug(`Execution of system job "${jobName}" finished with error.`)
            logger.logError(error as Error)
            job.stats.errors += 1
            logs.push(new SystemJobLogEntry(error))
        }
        finally {
            this.addLogEntry(job.sysJob, logs)
        }
    }

    private addLogEntry(job: SystemJob, newLogs: SystemJobLogEntry[]): void {
        let allLogs: SystemJobLogEntry[];

        if (!this._logs.has(job.name)) {
            this._logs.set(job.name, [])
        }

        allLogs = this._logs.get(job.name)!
        allLogs.unshift(...newLogs)

        if (allLogs.length > MAX_LOG_ENTRIES) {
            allLogs.splice(MAX_LOG_ENTRIES, allLogs.length - MAX_LOG_ENTRIES)
        }
    }

    private buildCronExpression(job: SystemJob): string {

        if (isNaN(job.every)) {
            throw new PropelError(`Expected a numeric value in attribute "every".
Value received: ${String(job.every)}.`)
        }

        if (!job.unit ) {
            throw new PropelError(`Expected a not null reference for attribute "unit". 
Value received: ${String(job.unit)}`)
        }

        switch (job.unit) {
            case SystemJobUnits.Seconds:
                return (job.every > 1) ? `*/${Math.trunc(job.every)} * * * * *` : `* * * * * *`
            case SystemJobUnits.Minutes:
                return (job.every > 1) ? `0 */${Math.trunc(job.every)} * * * *` : `0 * * * * *`
            case SystemJobUnits.Hours:
                return (job.every > 1) ? `0 0 */${Math.trunc(job.every)} * * *` : `0 0 * * * *`
            case SystemJobUnits.Days:
                return (job.every > 1) ? `0 0 0 */${Math.trunc(job.every)} * *` : `0 0 0 * * *`
            default:
                throw new PropelError(`Uknown unit of time received. Value received: ${String(job.unit)}`)
        }
    }
}

export let systemJobService = new SystemJobService();
