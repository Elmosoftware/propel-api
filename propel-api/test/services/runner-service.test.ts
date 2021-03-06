import { testingWorkflows } from "./testing-workflows";
import { pool } from "../../services/invocation-service-pool";
import { Runner } from "../../services/runner-service";
import { ExecutionStatus } from "../../../propel-shared/models/execution-status";
import { InvocationMessage, InvocationStatus } from "../../../propel-shared/core/invocation-message";
import { ExecutionLog } from "../../../propel-shared/models/execution-log";
import { APIResponse } from "../../../propel-shared/core/api-response";

let runner: Runner;

afterAll(() => {
    pool.disposeSync();
    pool.reset();
})

describe("Runner Class - execute()", () => {

    beforeEach(() => {
        runner = new Runner();
        runner.saveExecutionLog = (log: ExecutionLog) => {
            return Promise.resolve(new APIResponse<string>(null, "newid"));
        }
    })

    test(`Single step Workflow`, (done) => {

        let w = testingWorkflows.Worflow_S1EnabledNoParamNoTargetNoThrow;

        runner.execute(w)
            .then((msg: InvocationMessage) => {
                if (msg.logId) {
                    expect(runner.executionLog?.status).toEqual(ExecutionStatus.Success);
                    expect(runner.executionLog?.startedAt).not.toBe(null);
                    expect(runner.executionLog?.endedAt).not.toBe(null);
                    expect(runner.executionLog?.executionSteps.length).toEqual(w.steps.length);
                    expect(runner.executionLog?.executionSteps[0].execError).toBe(null);
                    expect(runner.executionLog?.executionSteps[0].status).toEqual(ExecutionStatus.Success);
                    expect(runner.executionLog?.executionSteps[0].stepName).toEqual(w.steps[0].name);
                    expect(runner.executionLog?.executionSteps[0].targets.length).toEqual(1); //Localhost!
                    expect(runner.executionLog?.executionSteps[0].targets[0].execErrors.length).toEqual(0);
                    expect(runner.executionLog?.executionSteps[0].targets[0].FQDN).toEqual(runner.localTarget.FQDN); //Localhost!
                }
                else {
                    expect(msg.logId).not.toBe(null);
                }

                done();
            })
            .catch((err) => {
                //IMPORTANT: Is not expected an error in this call!!!!
                expect(err).toEqual("Is not expected an error in this call!!!!")
            })

    }, 15000);
    test(`Single step Workflow with Throwing error script`, (done) => {

        let w = testingWorkflows.Worflow_S1EnabledNoParamNoTargetThrow;

        runner.execute(w)
            .then((msg: InvocationMessage) => {
                if (msg.logId) {
                    expect(runner.executionLog?.status).toEqual(ExecutionStatus.Faulty);
                    expect(runner.executionLog?.startedAt).not.toBe(null);
                    expect(runner.executionLog?.endedAt).not.toBe(null);
                    expect(runner.executionLog?.executionSteps.length).toEqual(w.steps.length);
                    expect(runner.executionLog?.executionSteps[0].execError).toBe(null);
                    expect(runner.executionLog?.executionSteps[0].status).toEqual(ExecutionStatus.Faulty);
                    expect(runner.executionLog?.executionSteps[0].stepName).toEqual(w.steps[0].name);
                    expect(runner.executionLog?.executionSteps[0].targets.length).toEqual(1); //Localhost!
                    expect(runner.executionLog?.executionSteps[0].targets[0].execErrors.length).toEqual(1); //Localhost!
                    expect(runner.executionLog?.executionSteps[0].targets[0].execErrors[0].message).toContain("This error is from the script!");
                    expect(runner.executionLog?.executionSteps[0].targets[0].FQDN).toEqual(runner.localTarget.FQDN); //Localhost!
                }
                else {
                    expect(msg.logId).not.toBe(null);
                }

                done();
            })
            .catch((err) => {
                //IMPORTANT: Is not expected an error in this call!!!!
                expect(err).toEqual("Is not expected an error in this call!!!!")
            })

    }, 15000);
    test(`Double step Workflow`, (done) => {

        let w = testingWorkflows.Worflow_S2Enabled;

        runner.execute(w)
            .then((msg: InvocationMessage) => {
                if (msg.logId) {
                    expect(runner.executionLog?.status).toEqual(ExecutionStatus.Success);
                    expect(runner.executionLog?.startedAt).not.toBe(null);
                    expect(runner.executionLog?.endedAt).not.toBe(null);
                    expect(runner.executionLog?.executionSteps.length).toEqual(w.steps.length);

                    //1st Step:
                    expect(runner.executionLog?.executionSteps[0].execError).toBe(null);
                    expect(runner.executionLog?.executionSteps[0].status).toEqual(ExecutionStatus.Success);
                    expect(runner.executionLog?.executionSteps[0].stepName).toEqual(w.steps[0].name);
                    expect(runner.executionLog?.executionSteps[0].targets.length).toEqual(2);
                    expect(runner.executionLog?.executionSteps[0].targets[0].FQDN).toEqual(w.steps[0].targets[0].FQDN);
                    expect(runner.executionLog?.executionSteps[0].targets[0].execErrors.length).toEqual(0);
                    expect(runner.executionLog?.executionSteps[0].targets[1].FQDN).toEqual(w.steps[0].targets[1].FQDN);
                    expect(runner.executionLog?.executionSteps[0].targets[1].execErrors.length).toEqual(0);

                    //2nd Step:
                    expect(runner.executionLog?.executionSteps[1].execError).toBe(null);
                    expect(runner.executionLog?.executionSteps[1].status).toEqual(ExecutionStatus.Success);
                    expect(runner.executionLog?.executionSteps[1].stepName).toEqual(w.steps[1].name);
                    expect(runner.executionLog?.executionSteps[1].targets.length).toEqual(1); //Localhost!
                    expect(runner.executionLog?.executionSteps[1].targets[0].execErrors.length).toEqual(0);
                    expect(runner.executionLog?.executionSteps[1].targets[0].FQDN).toEqual(runner.localTarget.FQDN); //Localhost!
                }
                else {
                    expect(msg.logId).not.toBe(null);
                }

                done();
            })
            .catch((err) => {
                //IMPORTANT: Is not expected an error in this call!!!!
                expect(err).toEqual("Is not expected an error in this call!!!!")
            })

    }, 15000);
    test(`Double step Workflow, first step throw and abort`, (done) => {

        let w = testingWorkflows.Worflow_S2EnabledThrow;

        runner.execute(w)
            .then((msg: InvocationMessage) => {
                if (msg.logId) {
                    expect(runner.executionLog?.status).toEqual(ExecutionStatus.Aborted);
                    expect(runner.executionLog?.startedAt).not.toBe(null);
                    expect(runner.executionLog?.endedAt).not.toBe(null);
                    expect(runner.executionLog?.executionSteps.length).toEqual(w.steps.length);

                    //1st Step:
                    expect(runner.executionLog?.executionSteps[0].execError).toBe(null);
                    expect(runner.executionLog?.executionSteps[0].status).toEqual(ExecutionStatus.Faulty);
                    expect(runner.executionLog?.executionSteps[0].stepName).toEqual(w.steps[0].name);
                    expect(runner.executionLog?.executionSteps[0].targets.length).toEqual(1); //Localhost!

                    //2nd Step:
                    expect(runner.executionLog?.executionSteps[1].execError).toBe(null);
                    expect(runner.executionLog?.executionSteps[1].status).toEqual(ExecutionStatus.Aborted);
                    expect(runner.executionLog?.executionSteps[1].stepName).toEqual(w.steps[1].name);
                    expect(runner.executionLog?.executionSteps[1].targets.length).toEqual(0); //The step was aborted, so no
                    //targets have been added to the execution. 
                }
                else {
                    expect(msg.logId).not.toBe(null);
                }

                done();
            })
            .catch((err) => {
                //IMPORTANT: Is not expected an error in this call!!!!
                expect(err).toEqual("Is not expected an error in this call!!!!")
            })

    }, 15000);
    test(`Double step Workflow, first step ok!, second step with single disabled target`, (done) => {

        let w = testingWorkflows.Worflow_S2EnabledTargetDisabled;
        runner.execute(w)
            .then((msg: InvocationMessage) => {
                if (msg.logId) {
                    expect(runner.executionLog?.status).toEqual(ExecutionStatus.Success);
                    expect(runner.executionLog?.startedAt).not.toBe(null);
                    expect(runner.executionLog?.endedAt).not.toBe(null);
                    expect(runner.executionLog?.executionSteps.length).toEqual(w.steps.length);

                    //1st Step:
                    expect(runner.executionLog?.executionSteps[0].execError).toBe(null);
                    expect(runner.executionLog?.executionSteps[0].status).toEqual(ExecutionStatus.Success);
                    expect(runner.executionLog?.executionSteps[0].targets.length).toEqual(1); //Localhost!
                    expect(runner.executionLog?.executionSteps[0].targets[0].execErrors.length).toEqual(0);
                    expect(runner.executionLog?.executionSteps[0].targets[0].execResults.length).toBeGreaterThan(0);
                    expect(runner.executionLog?.executionSteps[0].targets[0].status).toEqual(ExecutionStatus.Success);

                    //2nd Step:
                    expect(runner.executionLog?.executionSteps[1].execError).toBe(null);
                    expect(runner.executionLog?.executionSteps[1].status).toEqual(ExecutionStatus.Skipped);
                    expect(runner.executionLog?.executionSteps[1].targets.length).toEqual(1);
                    expect(runner.executionLog?.executionSteps[1].targets[0].status).toEqual(ExecutionStatus.Skipped);

                }
                else {
                    expect(msg.logId).not.toBe(null);
                }

                done();
            })
            .catch((err) => {
                //IMPORTANT: Is not expected an error in this call!!!!
                expect(err).toEqual("Is not expected an error in this call!!!!")
            })

    }, 15000);
    test(`User cancellation test`, (done) => {

        let w = testingWorkflows.Worflow_S2EnabledTargetDisabledFast;

        setTimeout(() => {
            //1st step will take 3s to complete, so we will sed the cancel signal 1s after 
            //the execution started:
            runner.cancelExecution();
        }, 1000);

        runner.execute(w)
            .then((msg: InvocationMessage) => {
                if (msg.logId) {
                    expect(runner.executionLog?.status).toEqual(ExecutionStatus.CancelledByUser);
                    expect(runner.executionLog?.startedAt).not.toBe(null);
                    expect(runner.executionLog?.endedAt).not.toBe(null);
                    expect(runner.executionLog?.executionSteps.length).toEqual(w.steps.length);

                    //1st Step:
                    expect(runner.executionLog?.executionSteps[0].execError).toBe(null);
                    expect(runner.executionLog?.executionSteps[0].status).toEqual(ExecutionStatus.Success);
                    expect(runner.executionLog?.executionSteps[0].targets.length).toEqual(1); //Localhost!
                    expect(runner.executionLog?.executionSteps[0].targets[0].execErrors.length).toEqual(0);
                    expect(runner.executionLog?.executionSteps[0].targets[0].execResults.length).toBeGreaterThan(0);
                    expect(runner.executionLog?.executionSteps[0].targets[0].status).toEqual(ExecutionStatus.Success);

                    //2nd Step:
                    expect(runner.executionLog?.executionSteps[1].execError).toBe(null);
                    expect(runner.executionLog?.executionSteps[1].status).toEqual(ExecutionStatus.CancelledByUser);

                }
                else {
                    expect(msg.logId).not.toBe(null);
                }

                done();
            })
            .catch((err) => {
                //IMPORTANT: Is not expected an error in this call!!!!
                expect(err).toEqual("Is not expected an error in this call!!!!")
            })

    }, 15000);
    test(`User Killing execution test`, (done) => {

        let w = testingWorkflows.Worflow_S2EnabledTargetDisabledFast;

        setTimeout(() => {
            //We will kill the execution after two seconds.
            runner.cancelExecution(true);
        }, 2000);

        runner.execute(w)
            .then((msg: InvocationMessage) => {
                if (msg.logId) {
                    expect(runner.executionLog?.status).toEqual(ExecutionStatus.CancelledByUser);
                    expect(runner.executionLog?.startedAt).not.toBe(null);
                    expect(runner.executionLog?.endedAt).not.toBe(null);
                    expect(runner.executionLog?.executionSteps.length).toEqual(w.steps.length);

                    //1st Step:
                    expect(runner.executionLog?.executionSteps[0].execError).toBe(null);
                    expect(runner.executionLog?.executionSteps[0].status).toEqual(ExecutionStatus.Faulty);
                    expect(runner.executionLog?.executionSteps[0].targets.length).toEqual(1); //Localhost!
                    expect(runner.executionLog?.executionSteps[0].targets[0].execErrors.length).toEqual(1);
                    expect(runner.executionLog?.executionSteps[0].targets[0].execResults.length).toEqual(0);
                    expect(runner.executionLog?.executionSteps[0].targets[0].status).toEqual(ExecutionStatus.Faulty);

                    //2nd Step:
                    expect(runner.executionLog?.executionSteps[1].execError).toBe(null);
                    expect(runner.executionLog?.executionSteps[1].status).toEqual(ExecutionStatus.CancelledByUser);

                }
                else {
                    expect(msg.logId).not.toBe(null);
                }

                done();
            })
            .catch((err) => {
                //IMPORTANT: Is not expected an error in this call!!!!
                expect(err).toEqual("Is not expected an error in this call!!!!")
            })

    }, 15000);
})