import { CronJob, CronJobParams } from "cron";
import { DateTime } from "luxon";

import { SystemJob, SystemJobUnits, SystemJobLogEntry, MAX_LOG_ENTRIES } from "../core/system-job";
import { PropelError } from "../../propel-shared/core/propel-error";
import { logger } from "./logger-service";

type JobStats = { successful: number, errors: number}
type Job = { sysJob: SystemJob, cronJob: CronJob, stats: JobStats }

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
     * Returns all the logs recorder for a specified job.
     * @param jobName Job name to get logs for.
     * @returns All the logs recorded by the specified job.
     */
    getLogs(jobName: string): SystemJobLogEntry[] {
        if (!this._logs.has(jobName)) return [];
        else return this._logs.get(jobName)!;
    }

    /**
     * Return the specified job stats or a null reference if there is no job with the given name.
     * @param jobName Name of the job whose stats we want to get.
     * @returns The job execution stats.
     */
    getJobStats(jobName: string): JobStats | null{
        if (!this._jobs.has(jobName)) return null;
        let job: Job = this._jobs.get(jobName)!;
        return job.stats
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

        try {
            if (!job) {
                throw new PropelError(`The job with name "${jobName}" wasn't found ` + 
                    `in the internal jobs list in the SystemJobService at the moment of run.`)
            }
            logger.logDebug(`Starting system job "${jobName}" execution.`)
            this.addLogEntry(job.sysJob, `Job Execution started.`)
            this.addLogEntry(job.sysJob, await job.sysJob.command())
            job.stats.successful += 1
            this.addLogEntry(job.sysJob, `Job Execution ended succesfully.`)
            logger.logDebug(`Execution of system job "${jobName}" finished succesfully.`)
        } catch (error) {
            logger.logDebug(`Execution of system job "${jobName}" finished with error.`)
            logger.logError(error as Error)

            if (job) {
                job.stats.errors += 1
                this.addLogEntry(jobName, { 
                    ts: new Date(), 
                    msg: `Job Execution ended With Error. ERROR details:\r\n${this.extractErrorDetails(error)}`, 
                    isError: true 
                })
            }
        }
    }

    private extractErrorDetails(err: any): string {
        let ret: string = "";

        if (!err) return ret;
        if(typeof err =="string") return err;
        if (typeof err == "object") {
            Object.getOwnPropertyNames(err)
                .sort((a, b) => a.localeCompare(b))
                .forEach((prop) => {
                    ret += `- ${prop}: ${err[prop].toString()}\r\n`
                })
        }

        return ret;
    }

    private addLogEntry(job: SystemJob | string, msg: string | SystemJobLogEntry | SystemJobLogEntry[] | undefined): void {
        let logs: SystemJobLogEntry[];
        let jobName: string;

        if (!msg)  return;
        if (!job) return;
        if (typeof job == "string") {
            jobName = job;
        } 
        else {
            jobName = job.name
        }
        
        if (!this._logs.has(jobName)) {
            this._logs.set(jobName, [])
        }

        logs = this._logs.get(jobName)!

        if (typeof msg == "string") {
            logs.push({ts: new Date(), msg: msg, isError: false})
        }
        else if (Array.isArray(msg)) {
            logs.push(...msg)
        }
        else {
            logs.push(msg)
        }

        if (logs.length > MAX_LOG_ENTRIES) {
            logs.splice(0, logs.length - MAX_LOG_ENTRIES)
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
