import { testingWorkflows } from "./testing-workflows";
import { pool } from "../../services/invocation-service-pool";
import { Runner } from "../../services/runner-service";
import { ExecutionLog } from "../../models/execution-log";
import { ExecutionStatus } from "../../models/execution-status";

let runner: Runner;

afterAll(() => {
    pool.disposeSync();
    pool.reset();
})

describe("Runner Class - execute()", () => {

    beforeEach(() => {
        runner = new Runner();
    })

    test(`Single step Workflow`, (done) => {

        let w = testingWorkflows.Worflow_S1EnabledNoParamNoTargetNoThrow;

        runner.execute(w)
            .then((log: ExecutionLog) => {
                expect(log.status).toEqual(ExecutionStatus.Success);
                expect(log.startedAt).not.toBe(null);
                expect(log.endedAt).not.toBe(null);
                expect(log.executionSteps.length).toEqual(w.steps.length);
                expect(log.executionSteps[0].execError).toBe(null);
                expect(log.executionSteps[0].status).toEqual(ExecutionStatus.Success);
                expect(log.executionSteps[0].stepName).toEqual(w.steps[0].name);
                expect(log.executionSteps[0].targets.length).toEqual(1); //Localhost!
                expect(log.executionSteps[0].targets[0].execErrors.length).toEqual(0); 
                expect(log.executionSteps[0].targets[0].FQDN).toEqual(runner.localTarget.FQDN); //Localhost!

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
            .then((log: ExecutionLog) => {
                expect(log.status).toEqual(ExecutionStatus.Faulty);
                expect(log.startedAt).not.toBe(null);
                expect(log.endedAt).not.toBe(null);
                expect(log.executionSteps.length).toEqual(w.steps.length);
                expect(log.executionSteps[0].execError).toBe(null);
                expect(log.executionSteps[0].status).toEqual(ExecutionStatus.Faulty);
                expect(log.executionSteps[0].stepName).toEqual(w.steps[0].name);
                expect(log.executionSteps[0].targets.length).toEqual(1); //Localhost!
                expect(log.executionSteps[0].targets[0].execErrors.length).toEqual(1); //Localhost!
                expect(log.executionSteps[0].targets[0].execErrors[0].message).toContain("This error is from the script!");
                expect(log.executionSteps[0].targets[0].FQDN).toEqual(runner.localTarget.FQDN); //Localhost!

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
            .then((log: ExecutionLog) => {
                expect(log.status).toEqual(ExecutionStatus.Success);
                expect(log.startedAt).not.toBe(null);
                expect(log.endedAt).not.toBe(null);
                expect(log.executionSteps.length).toEqual(w.steps.length);

                //1st Step:
                expect(log.executionSteps[0].execError).toBe(null);
                expect(log.executionSteps[0].status).toEqual(ExecutionStatus.Success);
                expect(log.executionSteps[0].stepName).toEqual(w.steps[0].name);
                expect(log.executionSteps[0].targets.length).toEqual(2); 
                expect(log.executionSteps[0].targets[0].FQDN).toEqual(w.steps[0].targets[0].FQDN); 
                expect(log.executionSteps[0].targets[0].execErrors.length).toEqual(0); 
                expect(log.executionSteps[0].targets[1].FQDN).toEqual(w.steps[0].targets[1].FQDN); 
                expect(log.executionSteps[0].targets[1].execErrors.length).toEqual(0); 

                //2nd Step:
                expect(log.executionSteps[1].execError).toBe(null);
                expect(log.executionSteps[1].status).toEqual(ExecutionStatus.Success);
                expect(log.executionSteps[1].stepName).toEqual(w.steps[1].name);
                expect(log.executionSteps[1].targets.length).toEqual(1); //Localhost!
                expect(log.executionSteps[1].targets[0].execErrors.length).toEqual(0); 
                expect(log.executionSteps[1].targets[0].FQDN).toEqual(runner.localTarget.FQDN); //Localhost!

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
            .then((log: ExecutionLog) => {
                expect(log.status).toEqual(ExecutionStatus.Aborted);
                expect(log.startedAt).not.toBe(null);
                expect(log.endedAt).not.toBe(null);
                expect(log.executionSteps.length).toEqual(w.steps.length);

                //1st Step:
                expect(log.executionSteps[0].execError).toBe(null);
                expect(log.executionSteps[0].status).toEqual(ExecutionStatus.Faulty);
                expect(log.executionSteps[0].stepName).toEqual(w.steps[0].name);
                expect(log.executionSteps[0].targets.length).toEqual(1); //Localhost!

                //2nd Step:
                expect(log.executionSteps[1].execError).toBe(null);
                expect(log.executionSteps[1].status).toEqual(ExecutionStatus.Aborted);
                expect(log.executionSteps[1].stepName).toEqual(w.steps[1].name);
                expect(log.executionSteps[1].targets.length).toEqual(0); //The step was aborted, so no
                //targets has been added to the execution. 

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
            .then((log: ExecutionLog) => {
                expect(log.status).toEqual(ExecutionStatus.Success);
                expect(log.startedAt).not.toBe(null);
                expect(log.endedAt).not.toBe(null);
                expect(log.executionSteps.length).toEqual(w.steps.length);

                //1st Step:
                expect(log.executionSteps[0].execError).toBe(null);
                expect(log.executionSteps[0].status).toEqual(ExecutionStatus.Success);
                expect(log.executionSteps[0].targets.length).toEqual(1); //Localhost!
                expect(log.executionSteps[0].targets[0].execErrors.length).toEqual(0);
                expect(log.executionSteps[0].targets[0].execResults.length).toBeGreaterThan(0);
                expect(log.executionSteps[0].targets[0].status).toEqual(ExecutionStatus.Success);

                //2nd Step:
                expect(log.executionSteps[1].execError).toBe(null);
                expect(log.executionSteps[1].status).toEqual(ExecutionStatus.Skipped);
                expect(log.executionSteps[1].targets.length).toEqual(1);
                expect(log.executionSteps[1].targets[0].status).toEqual(ExecutionStatus.Skipped);

                done();
            })
            .catch((err) => {
                //IMPORTANT: Is not expected an error in this call!!!!
                expect(err).toEqual("Is not expected an error in this call!!!!")
            })

    }, 15000);
})