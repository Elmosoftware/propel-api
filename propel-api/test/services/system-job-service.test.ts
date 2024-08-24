import { LogLevel } from "../../core/config";
import { SystemJob, SystemJobLogEntry, SystemJobUnits } from "../../../propel-shared/core/system-job";
import { SystemJobService } from "../../services/system-job-service";

function setEnVars() {
    process.env.LOGGING_LEVEL = LogLevel.Error //Setting the logging level to "Error"
    //to void having a flood of logging messages during the test.
    //You can comment the line if you wouldlike to see extra details.
}

class TestJobSuccessful implements SystemJob {
    readonly name: string = "TestJobSuccessful";
    readonly description: string = "Test job successful.";
    readonly unit: SystemJobUnits = SystemJobUnits.Seconds;
    readonly every: number = 1;
    readonly runImmediately: boolean = false;

    command(): SystemJobLogEntry | SystemJobLogEntry[] | undefined {
        return new SystemJobLogEntry(`TestJobSuccessful executed.`)
    }
}

class TestJobWithError implements SystemJob {
    readonly name: string = "TestJobWithError";
    readonly description: string = "Test job with error.";
    readonly unit: SystemJobUnits = SystemJobUnits.Seconds;
    readonly every: number = 1;
    readonly runImmediately: boolean = false;

    command(): SystemJobLogEntry | SystemJobLogEntry[] | undefined {
        throw new Error("Unexpected error inside TestJobWithError!")
    }
}

class AsyncTestJobSuccessful implements SystemJob {
    readonly name: string = "AsyncTestJobSuccessful";
    readonly description: string = "Async Test Job successful.";
    readonly unit: SystemJobUnits = SystemJobUnits.Seconds;
    readonly every: number = 1;
    readonly runImmediately: boolean = false;

    async command(): Promise<SystemJobLogEntry | SystemJobLogEntry[] | undefined> {
        return new SystemJobLogEntry(`AsyncTestJobSuccessful executed.`);
    }
}

class AsyncTestJobWithError implements SystemJob {
    readonly name: string = "AsyncTestJobWithError";
    readonly description: string = "Test job with error.";
    readonly unit: SystemJobUnits = SystemJobUnits.Seconds;
    readonly every: number = 1;
    readonly runImmediately: boolean = false;

    async command(): Promise<SystemJobLogEntry | SystemJobLogEntry[] | undefined> {
        throw new Error("Unexpected error inside TestJobWithError!")
    }
}

class TestJobSuccessfulRunImmediately implements SystemJob {
    readonly name: string = "TestJobSuccessfulRunImmediately";
    readonly description: string = "Test job successful that runs immediately.";
    readonly unit: SystemJobUnits = SystemJobUnits.Seconds;
    readonly every: number = 10;
    readonly runImmediately: boolean = true;

    command(): SystemJobLogEntry | SystemJobLogEntry[] | undefined {
        return new SystemJobLogEntry(`TestJobSuccessful that run immediately executed.`);
    }
}

describe("SystemJobService Class", () => {

    let testJobSuccessful: SystemJob;
    let asyncTestJobSuccessful: SystemJob;
    let testJobWithError: SystemJob;
    let asyncTestJobWithError: SystemJob;
    let testJobSuccessfulRunImmediately: SystemJob;
    let svc: SystemJobService;

    beforeEach(() => {
        testJobSuccessful = new TestJobSuccessful();
        asyncTestJobSuccessful = new AsyncTestJobSuccessful();
        testJobWithError = new TestJobWithError();
        asyncTestJobWithError = new AsyncTestJobWithError();
        testJobSuccessfulRunImmediately = new TestJobSuccessfulRunImmediately()
        svc = new SystemJobService();
        setEnVars()
    })

    test(`Register twice a Job must throw`, () => {
        svc.register(testJobSuccessful)
        expect(() => {
            svc.register(testJobSuccessful)
        }).toThrow(`The job`);
    })

    test(`No job registered returns the expected in all methods`, (done) => {
        expect(() => {
            svc.stopAllJobs()
        }).not.toThrow();
        expect(svc.jobExists("missing job")).toBe(false);
        expect(Array.isArray(svc.getJobs())).toBe(true);
        expect(svc.getJobs().length).toEqual(0);
        expect(svc.getJobLogs("missing job")).toBe(null);
        expect(svc.getJobNextExecution("missing job")).toBe(null);
        done()
    }, 5000);

    test(`Single job registered returns that job data in all methods`, (done) => {
        svc.register(testJobSuccessful)

        expect(() => {
            svc.stopAllJobs()
        }).not.toThrow(); //Stopping all without time to run even once.
        expect(svc.jobExists(testJobSuccessful.name)).toBe(true);
        expect(Array.isArray(svc.getJobs())).toBe(true);
        expect(svc.getJobs().length).toEqual(1);
        expect(svc.getJobs()[0].name).toEqual(testJobSuccessful.name);
        expect(svc.getJobLogs(testJobSuccessful.name)).not.toBe(null);
        expect(svc.getJobLogs(testJobSuccessful.name)?.logs.length).toEqual(0);
        expect(svc.getJobLogs(testJobSuccessful.name)?.stats.errors).toEqual(0);
        expect(svc.getJobLogs(testJobSuccessful.name)?.stats.successful).toEqual(0);
        expect(svc.getJobNextExecution(testJobSuccessful.name)).not.toBe(null);
        done()
    }, 5000);

    test(`Single async job registered returns that job data in all methods`, (done) => {
        svc.register(asyncTestJobSuccessful)

        expect(() => {
            svc.stopAllJobs()
        }).not.toThrow(); //Stopping all without time to run even once.
        expect(svc.jobExists(asyncTestJobSuccessful.name)).toBe(true);
        expect(Array.isArray(svc.getJobs())).toBe(true);
        expect(svc.getJobs().length).toEqual(1);
        expect(svc.getJobs()[0].name).toEqual(asyncTestJobSuccessful.name);
        expect(svc.getJobLogs(asyncTestJobSuccessful.name)).not.toBe(null);
        expect(svc.getJobLogs(asyncTestJobSuccessful.name)?.logs.length).toEqual(0);
        expect(svc.getJobLogs(asyncTestJobSuccessful.name)?.stats.errors).toEqual(0);
        expect(svc.getJobLogs(asyncTestJobSuccessful.name)?.stats.successful).toEqual(0);
        expect(svc.getJobNextExecution(asyncTestJobSuccessful.name)).not.toBe(null);
        done()
    }, 5000);

    test(`Multiple jobs registered returns the right job data in all methods`, (done) => {
        svc.register(testJobSuccessful)
        svc.register(testJobWithError)
        svc.register(asyncTestJobSuccessful)
        svc.register(asyncTestJobWithError)

        expect(() => {
            svc.stopAllJobs()
        }).not.toThrow(); //Stopping all without time to run even once.
        expect(svc.jobExists(testJobSuccessful.name)).toBe(true);
        expect(svc.jobExists(testJobWithError.name)).toBe(true);
        expect(svc.jobExists(asyncTestJobSuccessful.name)).toBe(true);
        expect(svc.jobExists(asyncTestJobWithError.name)).toBe(true);
        expect(Array.isArray(svc.getJobs())).toBe(true);
        expect(svc.getJobs().length).toEqual(4);
        expect(svc.getJobs()[0].name).toEqual(testJobSuccessful.name);
        expect(svc.getJobs()[1].name).toEqual(testJobWithError.name);
        expect(svc.getJobs()[2].name).toEqual(asyncTestJobSuccessful.name);
        expect(svc.getJobs()[3].name).toEqual(asyncTestJobWithError.name);
        expect(svc.getJobLogs(testJobSuccessful.name)).not.toBe(null);
        expect(svc.getJobLogs(testJobWithError.name)).not.toBe(null);
        expect(svc.getJobLogs(asyncTestJobSuccessful.name)).not.toBe(null);
        expect(svc.getJobLogs(asyncTestJobWithError.name)).not.toBe(null);
        expect(svc.getJobLogs(testJobSuccessful.name)?.stats.errors).toEqual(0);
        expect(svc.getJobLogs(testJobSuccessful.name)?.stats.successful).toEqual(0);
        expect(svc.getJobLogs(testJobWithError.name)).not.toBe(null);
        expect(svc.getJobLogs(testJobWithError.name)?.stats.errors).toEqual(0);
        expect(svc.getJobLogs(testJobWithError.name)?.stats.successful).toEqual(0);
        expect(svc.getJobLogs(asyncTestJobSuccessful.name)).not.toBe(null);
        expect(svc.getJobLogs(asyncTestJobSuccessful.name)?.stats.errors).toEqual(0);
        expect(svc.getJobLogs(asyncTestJobSuccessful.name)?.stats.successful).toEqual(0);
        expect(svc.getJobLogs(asyncTestJobWithError.name)).not.toBe(null);
        expect(svc.getJobLogs(asyncTestJobWithError.name)?.stats.errors).toEqual(0);
        expect(svc.getJobLogs(asyncTestJobWithError.name)?.stats.successful).toEqual(0);
        expect(svc.getJobNextExecution(testJobSuccessful.name)).not.toBe(null);
        expect(svc.getJobNextExecution(testJobWithError.name)).not.toBe(null);
        expect(svc.getJobNextExecution(asyncTestJobSuccessful.name)).not.toBe(null);
        expect(svc.getJobNextExecution(asyncTestJobWithError.name)).not.toBe(null);
        done()
    }, 5000);

    test(`Single Job registered and executed at least once`, (done) => {

        svc.register(testJobSuccessful)

        setTimeout(() => {
            svc.stopAllJobs();
            expect(svc.jobExists(testJobSuccessful.name)).toBe(true);
            expect(Array.isArray(svc.getJobs())).toBe(true);
            expect(svc.getJobs().length).toEqual(1);
            expect(svc.getJobs()[0].name).toEqual(testJobSuccessful.name);
            expect(svc.getJobLogs(testJobSuccessful.name)).not.toBe(null);
            expect(svc.getJobLogs(testJobSuccessful.name)?.logs.length).toBeGreaterThan(0);
            expect(svc.getJobLogs(testJobSuccessful.name)).not.toBe(null);
            expect(svc.getJobLogs(testJobSuccessful.name)?.stats.errors).toEqual(0);
            expect(svc.getJobLogs(testJobSuccessful.name)?.stats.successful).toEqual(1);
            expect(svc.getJobNextExecution(testJobSuccessful.name)).not.toBe(null);
            done()
        }, 1000);
    }, 5000);

    test(`Single Job registered and executed at least once to run immediately`, (done) => {

        svc.register(testJobSuccessfulRunImmediately) //This job is configured to run every 10secs, but 
        //to run immediately the first time as soon the job is registered.

        setTimeout(() => {
            svc.stopAllJobs();
            expect(svc.jobExists(testJobSuccessfulRunImmediately.name)).toBe(true);
            expect(Array.isArray(svc.getJobs())).toBe(true);
            expect(svc.getJobs().length).toEqual(1);
            expect(svc.getJobs()[0].name).toEqual(testJobSuccessfulRunImmediately.name);
            expect(svc.getJobLogs(testJobSuccessfulRunImmediately.name)).not.toBe(null);
            expect(svc.getJobLogs(testJobSuccessfulRunImmediately.name)?.logs.length).toBeGreaterThan(0);
            expect(svc.getJobLogs(testJobSuccessfulRunImmediately.name)).not.toBe(null);
            expect(svc.getJobLogs(testJobSuccessfulRunImmediately.name)?.stats.errors).toEqual(0);
            expect(svc.getJobLogs(testJobSuccessfulRunImmediately.name)?.stats.successful).toEqual(1);
            expect(svc.getJobNextExecution(testJobSuccessfulRunImmediately.name)).not.toBe(null);
            done()
        }, 1000); //Checking the status at 1 sec.
    }, 5000);

    test(`Single Async Job registered and executed at least once`, (done) => {

        svc.register(asyncTestJobSuccessful)

        setTimeout(() => {
            svc.stopAllJobs();
            expect(svc.jobExists(asyncTestJobSuccessful.name)).toBe(true);
            expect(Array.isArray(svc.getJobs())).toBe(true);
            expect(svc.getJobs().length).toEqual(1);
            expect(svc.getJobs()[0].name).toEqual(asyncTestJobSuccessful.name);
            expect(svc.getJobLogs(asyncTestJobSuccessful.name)).not.toBe(null);
            expect(svc.getJobLogs(asyncTestJobSuccessful.name)?.logs.length).toBeGreaterThan(0);
            expect(svc.getJobLogs(asyncTestJobSuccessful.name)).not.toBe(null);
            expect(svc.getJobLogs(asyncTestJobSuccessful.name)?.stats.errors).toEqual(0);
            expect(svc.getJobLogs(asyncTestJobSuccessful.name)?.stats.successful).toEqual(1);
            expect(svc.getJobNextExecution(asyncTestJobSuccessful.name)).not.toBe(null);
            done()
        }, 1000);
    }, 5000);

    test(`Single Async Job that throws an error registered and executed at least once`, (done) => {

        svc.register(asyncTestJobWithError)

        setTimeout(() => {
            svc.stopAllJobs();
            expect(svc.jobExists(asyncTestJobWithError.name)).toBe(true);
            expect(Array.isArray(svc.getJobs())).toBe(true);
            expect(svc.getJobs().length).toEqual(1);
            expect(svc.getJobs()[0].name).toEqual(asyncTestJobWithError.name);
            expect(svc.getJobLogs(asyncTestJobWithError.name)).not.toBe(null);
            expect(svc.getJobLogs(asyncTestJobWithError.name)?.logs.length).toBeGreaterThan(0);
            expect(svc.getJobLogs(asyncTestJobWithError.name)).not.toBe(null);
            expect(svc.getJobLogs(asyncTestJobWithError.name)?.stats.errors).toEqual(1);
            expect(svc.getJobLogs(asyncTestJobWithError.name)?.stats.successful).toEqual(0);
            expect(svc.getJobNextExecution(asyncTestJobWithError.name)).not.toBe(null);
            done()
        }, 1000);
    }, 5000);

    test(`Multiple Jobs registered and executed at least once`, (done) => {

        svc.register(testJobSuccessful)
        svc.register(testJobWithError)

        setTimeout(() => {
            svc.stopAllJobs();
            expect(svc.getJobLogs(testJobSuccessful.name)).not.toBe(null);
            expect(svc.getJobLogs(testJobSuccessful.name)?.logs.length).toBeGreaterThan(0);
            expect(svc.getJobLogs(testJobSuccessful.name)).not.toBe(null);
            expect(svc.getJobLogs(testJobSuccessful.name)?.stats.errors).toEqual(0);
            expect(svc.getJobLogs(testJobSuccessful.name)?.stats.successful).toEqual(1);
            expect(svc.getJobNextExecution(testJobSuccessful.name)).not.toBe(null);
            expect(svc.getJobLogs(testJobWithError.name)).not.toBe(null);
            expect(svc.getJobLogs(testJobWithError.name)?.stats.errors).toEqual(1);
            expect(svc.getJobLogs(testJobWithError.name)?.stats.successful).toEqual(0);
            expect(svc.getJobNextExecution(testJobWithError.name)).not.toBe(null);
            done()
        }, 1000);

    }, 5000);
})


