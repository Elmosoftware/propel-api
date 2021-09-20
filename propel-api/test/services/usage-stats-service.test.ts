import { ExecutionError } from "../../../propel-shared/models/execution-error";
import { ExecutionLog } from "../../../propel-shared/models/execution-log";
import { GraphSeriesData } from "../../../propel-shared/models/graph-series-data";
import { Utils } from "../../../propel-shared/utils/utils";
import { cfg } from "../../core/config";
import { UsageStatsService } from "../../services/usage-stats-service";
import { testingExecutionLogs } from "./testing-executionlogs";

function getUsageStatsServiceInstance(logs: ExecutionLog[], totalWorkflows:number = 1,
        totalScripts:number = 1, totalTargets:number = 1, 
        totalCredentials:number = 1): UsageStatsService {
    let ret: UsageStatsService = new UsageStatsService();
    //Mocking the private methods with DB calls:

    //@ts-ignore
    ret.getAllExecutionLogs = async (): Promise<ExecutionLog[]> => {
        return logs
    }

    //@ts-ignore
    ret.getAllWorkflowsCount = async (): Promise<number> => {
        return totalWorkflows
    }
    //@ts-ignore
    ret.getAllScriptsCount = async (): Promise<number> => {
        return totalScripts
    }
    //@ts-ignore
    ret.getAllTargetsCount = async (): Promise<number> => {
        return totalTargets
    }
    //@ts-ignore
    ret.getAllCredentialsCount = async (): Promise<number> => {
        return totalCredentials
    }

    return ret;
}

function checkForPositives(seriesName: string | undefined, data: GraphSeriesData[] | undefined, 
    positiveIndexes: number[]): boolean {

    let msg: string = ""

    data?.forEach((gd, i) => {
        if (positiveIndexes.includes(i) && gd.value == 0) {
            msg += `\r\nEXPECTED POSITIVE for ${seriesName} series data at index: ${i} but it has value "0". ` +
                `Series name: "${gd.name}", ` +
                `LastTimeUpdated:"${(gd.lastTimeUpdated) ? gd.lastTimeUpdated.toString() : ""}"`;
        }

        if (!positiveIndexes.includes(i) && gd.value != 0) {
            msg += `\r\nNOT EXPECTED POSITIVE for ${seriesName} series data at index: ${i} but it has value "${gd.value}". ` +
                `Series name: "${gd.name}", ` +
                `LastTimeUpdated:"${(gd.lastTimeUpdated) ? gd.lastTimeUpdated.toString() : ""}"`;
        }
    })

    if (msg) {
        throw msg
    }

    return true;
}

beforeAll(() => {

})

describe("UsageStatsService Class - updateStats", () => {

    describe("Daily Executions", () => {

        beforeEach(() => {

        })

        test(`Empty Execution Log`, async () => {

            let us = getUsageStatsServiceInstance([]);

            await us.updateStats();

            expect(us.currentStats).not.toBe(null);
        });

        test(`Single Execution Log Workflows positives only`, async () => {

            let logs = testingExecutionLogs.getExecLogs(1, 0, [Utils.addDays(new Date(), -1)])

            let us = getUsageStatsServiceInstance(logs);

            await us.updateStats();

            expect(us.currentStats).not.toBe(null);
            expect(us.currentStats?.dailyExecutions.length).toEqual(2);
            expect(us.currentStats?.dailyExecutions[0].series.length).toEqual(cfg.executionLogRetentionDays);
            expect(us.currentStats?.dailyExecutions[1].series.length).toEqual(cfg.executionLogRetentionDays);

            //Workflows series: The 2nd element, (today - 1), must be positive:
            expect(checkForPositives(us.currentStats?.dailyExecutions[0].name,
                us.currentStats?.dailyExecutions[0].series, [1])).toBe(true);

            //Quick Task series: All elements must have value 0:
            expect(checkForPositives(us.currentStats?.dailyExecutions[1].name,
                us.currentStats?.dailyExecutions[1].series, [])).toBe(true);
        });

        test(`Single Execution Log Quick Tasks positives only`, async () => {

            let logs = testingExecutionLogs.getExecLogs(1, 1, [Utils.addDays(new Date(), -1)])

            let us = getUsageStatsServiceInstance(logs);

            await us.updateStats();

            expect(us.currentStats).not.toBe(null);
            expect(us.currentStats?.dailyExecutions.length).toEqual(2);
            expect(us.currentStats?.dailyExecutions[0].series.length).toEqual(cfg.executionLogRetentionDays);
            expect(us.currentStats?.dailyExecutions[1].series.length).toEqual(cfg.executionLogRetentionDays);

            //Workflows series: All elements must have value 0:
            expect(checkForPositives(us.currentStats?.dailyExecutions[0].name,
                us.currentStats?.dailyExecutions[0].series, [])).toBe(true);

            //Quick Task series: The 2nd element, (today - 1), must be positive:
            expect(checkForPositives(us.currentStats?.dailyExecutions[1].name,
                us.currentStats?.dailyExecutions[1].series, [1])).toBe(true);
        });

        test(`Multiple Execution Logs With Workflows and Quick Tasks positives`, async () => {

            //Recall that if there is Quick task defines, they will be created first 
            //by "getExecLogs":
            let logs = testingExecutionLogs.getExecLogs(4, 2, [
                Utils.addDays(new Date(), -3), //Quick Task
                Utils.addDays(new Date(), -6), //Quick Task
                Utils.addDays(new Date(), -7), //Workflow
                Utils.addDays(new Date(), -13) //Workflow
            ])

            let us = getUsageStatsServiceInstance(logs);

            await us.updateStats();

            expect(us.currentStats).not.toBe(null);
            expect(us.currentStats?.dailyExecutions.length).toEqual(2);
            expect(us.currentStats?.dailyExecutions[0].series.length).toEqual(cfg.executionLogRetentionDays);
            expect(us.currentStats?.dailyExecutions[1].series.length).toEqual(cfg.executionLogRetentionDays);

            //Workflows series:
            expect(checkForPositives(us.currentStats?.dailyExecutions[0].name,
                us.currentStats?.dailyExecutions[0].series, [7, 13])).toBe(true);

            //Quick Task series:
            expect(checkForPositives(us.currentStats?.dailyExecutions[1].name,
                us.currentStats?.dailyExecutions[1].series, [3, 6])).toBe(true);
        });

        test(`Multiple Execution Logs With Workflows and Quick Tasks positives`, async () => {

            //Recall that if there is Quick task defines, they will be created first 
            //by "getExecLogs":
            let logs = testingExecutionLogs.getExecLogs(4, 2, [
                Utils.addDays(new Date(), -3), //Quick Task
                Utils.addDays(new Date(), -6), //Quick Task
                Utils.addDays(new Date(), -7), //Workflow
                Utils.addDays(new Date(), -13) //Workflow
            ])

            let us = getUsageStatsServiceInstance(logs);

            await us.updateStats();

            expect(us.currentStats).not.toBe(null);
            expect(us.currentStats?.dailyExecutions.length).toEqual(2);
            expect(us.currentStats?.dailyExecutions[0].series.length).toEqual(cfg.executionLogRetentionDays);
            expect(us.currentStats?.dailyExecutions[1].series.length).toEqual(cfg.executionLogRetentionDays);

            //Workflows series:
            expect(checkForPositives(us.currentStats?.dailyExecutions[0].name,
                us.currentStats?.dailyExecutions[0].series, [7, 13])).toBe(true);

            //Quick Task series:
            expect(checkForPositives(us.currentStats?.dailyExecutions[1].name,
                us.currentStats?.dailyExecutions[1].series, [3, 6])).toBe(true);
        });

        test(`Multiple Execution Logs With Workflows and Quick Tasks positives on repeated days`, async () => {

            //Recall that if there is Quick task defined, they will be created first 
            //by "getExecLogs":
            let logs = testingExecutionLogs.getExecLogs(11, 6, [
                Utils.addDays(new Date(), 0), //Quick Task 1
                Utils.addDays(new Date(), -7), //Quick Task 2
                Utils.addDays(new Date(), -9), //Quick Task 3
                Utils.addDays(new Date(), -9), //Quick Task 4
                Utils.addDays(new Date(), -9), //Quick Task 5
                Utils.addDays(new Date(), -10), //Quick Task 6
                Utils.addDays(new Date(), -10), //Workflow 1
                Utils.addDays(new Date(), -10), //Workflow 2
                Utils.addDays(new Date(), -14), //Workflow 3
                Utils.addDays(new Date(), -29), //Workflow 4
                Utils.addDays(new Date(), -29), //Workflow 5
            ])

            let us = getUsageStatsServiceInstance(logs);

            await us.updateStats();

            expect(us.currentStats).not.toBe(null);
            expect(us.currentStats?.dailyExecutions.length).toEqual(2);
            expect(us.currentStats?.dailyExecutions[0].series.length).toEqual(cfg.executionLogRetentionDays);
            expect(us.currentStats?.dailyExecutions[1].series.length).toEqual(cfg.executionLogRetentionDays);

            //Workflows series:
            expect(checkForPositives(us.currentStats?.dailyExecutions[0].name,
                us.currentStats?.dailyExecutions[0].series, [10, 14, 29])).toBe(true);

            //Quick Task series:
            expect(checkForPositives(us.currentStats?.dailyExecutions[1].name,
                us.currentStats?.dailyExecutions[1].series, [0, 7, 9, 10])).toBe(true);

            //Checking the values:
            //Workflows:
            expect(us.currentStats?.dailyExecutions[0].series[10].value).toEqual(2);
            expect(us.currentStats?.dailyExecutions[0].series[14].value).toEqual(1);
            expect(us.currentStats?.dailyExecutions[0].series[29].value).toEqual(2);
            //Quick Tasks:
            expect(us.currentStats?.dailyExecutions[1].series[0].value).toEqual(1);
            expect(us.currentStats?.dailyExecutions[1].series[7].value).toEqual(1);
            expect(us.currentStats?.dailyExecutions[1].series[9].value).toEqual(3);
            expect(us.currentStats?.dailyExecutions[1].series[10].value).toEqual(1);
        });
    });

    describe("Most used Workflows", () => {

        beforeEach(() => {

        })

        test(`Empty Execution Log`, async () => {

            let us = getUsageStatsServiceInstance([]);

            await us.updateStats();

            expect(us.currentStats?.mostUsedWorkflows).not.toBe(null);
            expect(us.currentStats?.mostUsedWorkflows.length).toEqual(0);
        });

        test(`Single Execution Log`, async () => {

            let logs = testingExecutionLogs.getExecLogs(1, 0, [Utils.addDays(new Date(), -1)])

            let us = getUsageStatsServiceInstance(logs);

            await us.updateStats();

            expect(us.currentStats).not.toBe(null);
            expect(us.currentStats?.mostUsedWorkflows.length).toEqual(1);
            expect(us.currentStats?.mostUsedWorkflows[0]._id).toEqual("0");
            expect(us.currentStats?.mostUsedWorkflows[0].name).toEqual("Workflow 0");
            expect(us.currentStats?.mostUsedWorkflows[0].value).toEqual(1);
        });

        test(`Multiple Execution Logs`, async () => {

            //Recall that if there is Quick task defines, they will be created first 
            //by "getExecLogs":
            let logs = testingExecutionLogs.getExecLogs(7, 0, [
                Utils.addDays(new Date(), -3), 
                Utils.addDays(new Date(), -6), 
                Utils.addDays(new Date(), -7), 
                Utils.addDays(new Date(), -13), 
                Utils.addDays(new Date(), -13), 
                Utils.addDays(new Date(), -15), 
                Utils.addDays(new Date(), -17) 
            ])

            //Manipulating logs for:
            //Second and third to be the same workflow:
            logs[2].workflow = Object.assign({}, logs[1].workflow);
            //The last 3 to be the same workflow:
            logs[5].workflow = Object.assign({}, logs[4].workflow);
            logs[6].workflow = Object.assign({}, logs[4].workflow);

            let us = getUsageStatsServiceInstance(logs);

            await us.updateStats();

            expect(us.currentStats).not.toBe(null);
            expect(us.currentStats?.mostUsedWorkflows.length).toEqual(4);
            expect(us.currentStats?.mostUsedWorkflows[0].value).toEqual(3); //The last 3 workflows.
            expect(us.currentStats?.mostUsedWorkflows[1].value).toEqual(2); //The second and third workflows.
            expect(us.currentStats?.mostUsedWorkflows[2].value).toEqual(1);
            expect(us.currentStats?.mostUsedWorkflows[3].value).toEqual(1);
        });
    });

    describe("Latest Executions", () => {

        beforeEach(() => {

        })

        test(`Empty Execution Log`, async () => {

            let us = getUsageStatsServiceInstance([]);

            await us.updateStats();

            expect(us.currentStats?.latestExecutions).not.toBe(null);
            expect(us.currentStats?.latestExecutions.length).toEqual(0);
        });

        test(`Single Execution Log`, async () => {

            let logs = testingExecutionLogs.getExecLogs(1, 0, [Utils.addDays(new Date(), -1)])

            let us = getUsageStatsServiceInstance(logs);

            await us.updateStats();

            expect(us.currentStats).not.toBe(null);
            expect(us.currentStats?.latestExecutions.length).toEqual(1);
            expect(us.currentStats?.latestExecutions[0]._id).toEqual(logs[0]._id);
            expect(us.currentStats?.latestExecutions[0].name).toEqual(logs[0].workflow.name);
            expect(us.currentStats?.latestExecutions[0].value).toEqual(1);
            expect(us.currentStats?.latestExecutions[0].lastTimeUpdated).toEqual(logs[0].startedAt);
        });

        test(`Multiple Execution Logs`, async () => {

            //Recall that if there is Quick task defines, they will be created first 
            //by "getExecLogs":
            let logs = testingExecutionLogs.getExecLogs(7, 0, [
                Utils.addDays(new Date(), -3), 
                Utils.addDays(new Date(), -6), 
                Utils.addDays(new Date(), -7), 
                Utils.addDays(new Date(), -13), 
                Utils.addDays(new Date(), -13), 
                Utils.addDays(new Date(), -15), 
                Utils.addDays(new Date(), -17) 
            ])

            let us = getUsageStatsServiceInstance(logs);

            await us.updateStats();

            expect(us.currentStats).not.toBe(null);
            expect(us.currentStats?.latestExecutions.length).toEqual(5);
        });
    });

    describe("Last Execution errors", () => {

        beforeEach(() => {

        })

        test(`Empty Execution Log`, async () => {

            let us = getUsageStatsServiceInstance([]);

            await us.updateStats();

            expect(us.currentStats?.lastExecutionErrors).not.toBe(null);
            expect(us.currentStats?.lastExecutionErrors.length).toEqual(0);
        });

        test(`Single Execution Log`, async () => {

            let logs = testingExecutionLogs.getExecLogs(1, 0, [Utils.addDays(new Date(), -1)])
            let errorTimestamp = new Date();

            //Adding one error:
            logs[0].executionSteps[0].targets[0].execErrors.push(new ExecutionError(new Error("Test error message.")))
            logs[0].executionSteps[0].targets[0].execErrors[0].throwAt = errorTimestamp;

            let us = getUsageStatsServiceInstance(logs);

            await us.updateStats();

            expect(us.currentStats).not.toBe(null);
            expect(us.currentStats?.lastExecutionErrors.length).toEqual(1);
            expect(us.currentStats?.lastExecutionErrors[0]._id).toEqual(logs[0]._id);
            // expect(us.currentStats?.latestExecutions[0].name).toEqual(logs[0].workflow.name);
            expect(us.currentStats?.lastExecutionErrors[0].lastTimeUpdated?.toLocaleString())
                .toEqual(errorTimestamp.toLocaleString());
        });

        test(`Multiple Execution Logs`, async () => {
            let errorTimestamp = new Date();
            //Recall that if there is Quick task defines, they will be created first 
            //by "getExecLogs":
            let logs = testingExecutionLogs.getExecLogs(7, 0, [
                Utils.addDays(new Date(), -3), 
                Utils.addDays(new Date(), -6), 
                Utils.addDays(new Date(), -7), 
                Utils.addDays(new Date(), -13), 
                Utils.addDays(new Date(), -13), 
                Utils.addDays(new Date(), -15), 
                Utils.addDays(new Date(), -17) 
            ])

            //Adding multiple errors:
            logs[0].executionSteps[0].targets[0].execErrors
                .push(new ExecutionError(new Error("Test error message 1.")))
            logs[0].executionSteps[0].targets[0].execErrors[0].throwAt = errorTimestamp;
            logs[2].executionSteps[0].targets[0].execErrors
                .push(new ExecutionError(new Error("Test error message 2.")))
            logs[2].executionSteps[0].targets[0].execErrors[0].throwAt = errorTimestamp;
            logs[3].executionSteps[0].targets[0].execErrors
                .push(new ExecutionError(new Error("Test error message 3.")))
            logs[3].executionSteps[0].targets[0].execErrors[0].throwAt = errorTimestamp;
            logs[4].executionSteps[0].targets[0].execErrors
                .push(new ExecutionError(new Error("Test error message 4.")))
            logs[4].executionSteps[0].targets[0].execErrors[0].throwAt = errorTimestamp;
            logs[5].executionSteps[0].targets[0].execErrors
                .push(new ExecutionError(new Error("Test error message 5.")))
            logs[5].executionSteps[0].targets[0].execErrors[0].throwAt = errorTimestamp;
            logs[6].executionSteps[0].targets[0].execErrors
                .push(new ExecutionError(new Error("Test error message 6.")))
            logs[6].executionSteps[0].targets[0].execErrors[0].throwAt = errorTimestamp;

            let us = getUsageStatsServiceInstance(logs);

            await us.updateStats();

            expect(us.currentStats).not.toBe(null);
            expect(us.currentStats?.lastExecutionErrors.length).toEqual(5);
        });
    });

    describe("Totals", () => {

        beforeEach(() => {

        })

        test(`Empty Execution Log`, async () => {

            let us = getUsageStatsServiceInstance([], 0, 0, 0, 0);

            await us.updateStats();

            expect(us.currentStats).not.toBe(null);
            expect(us.currentStats?.totalExecutions).toEqual(0);
            expect(us.currentStats?.totalWorkflows).toEqual(0);
            expect(us.currentStats?.totalScripts).toEqual(0);
            expect(us.currentStats?.totaltargets).toEqual(0);
            expect(us.currentStats?.totalCredentials).toEqual(0);
        });

        test(`Single Execution Log`, async () => {

            let logs = testingExecutionLogs.getExecLogs(1, 0, [Utils.addDays(new Date(), -1)])
            let errorTimestamp = new Date();

            
            let us = getUsageStatsServiceInstance(logs, 1, 2, 3, 4);

            await us.updateStats();

            expect(us.currentStats).not.toBe(null);
            expect(us.currentStats?.totalExecutions).toEqual(1);
            expect(us.currentStats?.totalWorkflows).toEqual(1);
            expect(us.currentStats?.totalScripts).toEqual(2);
            expect(us.currentStats?.totaltargets).toEqual(3);
            expect(us.currentStats?.totalCredentials).toEqual(4);
        });

        test(`Multiple Execution Logs`, async () => {
            let errorTimestamp = new Date();
            //Recall that if there is Quick task defines, they will be created first 
            //by "getExecLogs":
            let logs = testingExecutionLogs.getExecLogs(7, 0, [
                Utils.addDays(new Date(), -3), 
                Utils.addDays(new Date(), -6), 
                Utils.addDays(new Date(), -7), 
                Utils.addDays(new Date(), -13), 
                Utils.addDays(new Date(), -13), 
                Utils.addDays(new Date(), -15), 
                Utils.addDays(new Date(), -17) 
            ])

            let us = getUsageStatsServiceInstance(logs, 1, 2, 3, 4);

            await us.updateStats();

            expect(us.currentStats).not.toBe(null);
            expect(us.currentStats?.totalExecutions).toEqual(7);
            expect(us.currentStats?.totalWorkflows).toEqual(1);
            expect(us.currentStats?.totalScripts).toEqual(2);
            expect(us.currentStats?.totaltargets).toEqual(3);
            expect(us.currentStats?.totalCredentials).toEqual(4);
        });
    });


});
