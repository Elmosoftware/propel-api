import { testingWorkflows } from "./testing-workflows";
import { pool } from "../../services/powershell-service-pool";
import { Runner } from "../../services/runner-service";
import { ExecutionStatus } from "../../../propel-shared/models/execution-status";
import { ExecutionStats, WebsocketMessage } from "../../../propel-shared/core/websocket-message";
import { ExecutionLog } from "../../../propel-shared/models/execution-log";
import { Secret } from "../../../propel-shared/models/secret";
import { SecretValue } from "../../../propel-shared/models/secret-value";
import { Credential } from "../../../propel-shared/models/credential";
import { LogLevel } from "../../core/config";
import { SecurityToken } from "../../../propel-shared/core/security-token";
import { DataService } from "../../services/data-service";
import { RunnerServiceData } from "../../../propel-shared/core/runner-service-data";
import { Workflow } from "../../../propel-shared/models/workflow";
import { RuntimeParameters } from "../../../propel-shared/models/runtime-parameters";
import { ParameterValue } from "../../../propel-shared/models/parameter-value";
import { JSType } from "../../../propel-shared/core/type-definitions";

let runner: Runner;

afterAll(() => {
    pool.disposeAnForget();
    pool.reset();
})

describe("Runner Class - execute()", () => {

    let st: SecurityToken;

    beforeEach(() => {
        let tw = testingWorkflows;
        st = new SecurityToken()
        st.userId = DataService.getNewobjectId().toString();

        process.env.LOGGING_LEVEL = LogLevel.Error //Setting the logging level to "Error"
        //to void having a flood of logging messages during the test.
        //You can comment the line if you wouldlike to see extra details.
        process.env.POOL_STATS = "off" //This is to prevent to log pool stats in the DB (private 
        //method _handleObjectPoolEvent in the PowerSHellServicePool), which is going to cause errors 
        //and is difficult to mock.
        
        runner = new Runner();

        runner.getWorkflow = (id: string, token: SecurityToken): Promise<Workflow | undefined> => {
            return Promise.resolve(testingWorkflows.getWorkflowById(id));
        }    

        runner.saveExecutionLog = (log: ExecutionLog) => {
            return Promise.resolve("newid");
        }

        //Mocking the Credential cache inside the runner:

        //@ts-ignore
        runner._credentialCache.getCredentialsById = async (credentialIds: string[]): Promise<Credential[]> => {
            let ret: Credential[] = []

            credentialIds.forEach((id: string) => {
                //@ts-ignore
                ret.push(tw[id]) //Always ensure the Credential name is the same as the property "_id"!
            })

            return ret; //Here, (for a positive case), we expect to have only the credentials 
            //in $PropelCredentials.
        }

        //@ts-ignore
        runner._credentialCache.getSecretsById = async (secretIds: string[]): Promise<Secret<SecretValue>[]> => {
            let ret: Secret<SecretValue>[] = []

            secretIds.forEach((name: string) => {
                //@ts-ignore
                ret.push(tw[name])
            })

            return ret;  //Here, (for a positive case), we expect to have all the 
            //credentials secrets. The ones in the $PropelCredentials and the ones for the Targets credentials.
        }
    })

    test(`Single step Workflow`, (done) => {

        let w = testingWorkflows.Workflow_S1EnabledNoParamNoTargetNoThrow;
        let data: RunnerServiceData = new RunnerServiceData(w._id, [])

        runner.execute(data, st)
            .then((msg: WebsocketMessage<ExecutionStats>) => {
                if (msg.context?.logId) {
                    expect(String(runner.executionLog?.user)).toEqual(st.userId);
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
                    expect(msg.context?.logId).not.toBe(null);
                }

                done();
            })
            .catch((err) => {
                //IMPORTANT: Is not expected an error in this call!!!!
                expect(err).toEqual("Is not expected an error in this call!!!!")
                done();
            })

    }, 15000);
    test(`Single step Workflow with Throwing error script`, (done) => {

        let w = testingWorkflows.Workflow_S1EnabledNoParamNoTargetThrow;
        let data: RunnerServiceData = new RunnerServiceData(w._id, [])

        runner.execute(data, st)
            .then((msg: WebsocketMessage<ExecutionStats>) => {
                if (msg.context?.logId) {
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
                    expect(msg.context?.logId).not.toBe(null);
                }

                done();
            })
            .catch((err) => {
                //IMPORTANT: Is not expected an error in this call!!!!
                expect(err).toEqual("Is not expected an error in this call!!!!")
                done();
            })

    }, 15000);
    test(`Double step Workflow`, (done) => {

        let w = testingWorkflows.Workflow_S2Enabled;
        let data: RunnerServiceData = new RunnerServiceData(w._id, [])

        runner.execute(data, st)
            .then((msg: WebsocketMessage<ExecutionStats>) => {
                if (msg.context?.logId) {
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
                    expect(msg.context?.logId).not.toBe(null);
                }

                done();
            })
            .catch((err) => {
                //IMPORTANT: Is not expected an error in this call!!!!
                expect(err).toEqual("Is not expected an error in this call!!!!")
                done();
            })

    }, 15000);
    test(`Double step Workflow, first step throw and abort`, (done) => {

        let w = testingWorkflows.Workflow_S2EnabledThrow;
        let data: RunnerServiceData = new RunnerServiceData(w._id, [])

        runner.execute(data, st)
            .then((msg: WebsocketMessage<ExecutionStats>) => {
                if (msg.context?.logId) {
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
                    expect(msg.context?.logId).not.toBe(null);
                }

                done();
            })
            .catch((err) => {
                //IMPORTANT: Is not expected an error in this call!!!!
                expect(err).toEqual("Is not expected an error in this call!!!!")
                done();
            })

    }, 15000);
    test(`Double step Workflow, first step ok!, second step with single disabled target`, (done) => {

        let w = testingWorkflows.Workflow_S2EnabledTargetDisabled;
        let data: RunnerServiceData = new RunnerServiceData(w._id, [])

        runner.execute(data, st)
            .then((msg: WebsocketMessage<ExecutionStats>) => {
                if (msg.context?.logId) {
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
                    expect(msg.context?.logId).not.toBe(null);
                }

                done();
            })
            .catch((err) => {
                //IMPORTANT: Is not expected an error in this call!!!!
                expect(err).toEqual("Is not expected an error in this call!!!!")
                done();
            })

    }, 15000);
    test(`User cancellation test`, (done) => {

        let w = testingWorkflows.Workflow_S2EnabledTargetDisabledFast;
        let data: RunnerServiceData = new RunnerServiceData(w._id, [])

        setTimeout(() => {
            //1st step will take 3s to complete, so we will send the cancel signal 1s after 
            //the execution started:
            runner.cancelExecution();
        }, 1000);

        runner.execute(data, st)
            .then((msg: WebsocketMessage<ExecutionStats>) => {
                if (msg.context?.logId) {
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
                    expect(msg.context?.logId).not.toBe(null);
                }

                done();
            })
            .catch((err) => {
                //IMPORTANT: Is not expected an error in this call!!!!
                expect(err).toEqual("Is not expected an error in this call!!!!")
                done();
            })

    }, 15000);
    test(`User Killing execution test`, (done) => {

        let w = testingWorkflows.Workflow_S2EnabledTargetDisabledFast;
        let data: RunnerServiceData = new RunnerServiceData(w._id, [])

        setTimeout(() => {
            //We will kill the execution after two seconds.
            runner.cancelExecution(true);
        }, 2000);

        runner.execute(data, st)
            .then((msg: WebsocketMessage<ExecutionStats>) => {
                if (msg.context?.logId) {
                    expect(runner.executionLog?.status).toEqual(ExecutionStatus.CancelledByUser);
                    expect(runner.executionLog?.startedAt).not.toBe(null);
                    expect(runner.executionLog?.endedAt).not.toBe(null);
                    expect(runner.executionLog?.executionSteps.length).toEqual(w.steps.length);

                    //1st Step:
                    expect(runner.executionLog?.executionSteps[0].execError).toBe(null);
                    expect(runner.executionLog?.executionSteps[0].status).toEqual(ExecutionStatus.CancelledByUser);
                    expect(runner.executionLog?.executionSteps[0].targets.length).toEqual(1); //Localhost!
                    expect(runner.executionLog?.executionSteps[0].targets[0].execErrors.length).toEqual(0);
                    expect(runner.executionLog?.executionSteps[0].targets[0].execResults.length).toEqual(0);
                    expect(runner.executionLog?.executionSteps[0].targets[0].status).toEqual(ExecutionStatus.CancelledByUser);

                    //2nd Step:
                    expect(runner.executionLog?.executionSteps[1].execError).toBe(null);
                    expect(runner.executionLog?.executionSteps[1].status).toEqual(ExecutionStatus.CancelledByUser);

                }
                else {
                    expect(msg.context?.logId).not.toBe(null);
                }

                done();
            })
            .catch((err) => {
                //IMPORTANT: Is not expected an error in this call!!!!
                expect(err).toEqual("Is not expected an error in this call!!!!")
                done();
            })

    }, 15000);

    test(`Workflow with $PropelCredentials Parameter, 1 single credential`, (done) => {

        let w = testingWorkflows.Workflow_S1Enabled2TargetsEnabledWithCredFast //With Credentials!
        let data: RunnerServiceData = new RunnerServiceData(w._id, [])

        runner.execute(data, st)
            .then((msg: WebsocketMessage<ExecutionStats>) => {
                if (msg.context?.logId) {
                    expect(runner.executionLog?.status).toEqual(ExecutionStatus.Success);
                }
                else {
                    expect(msg.context?.logId).not.toBe(null);
                }

                done();
            })
            .catch((err) => {
                //IMPORTANT: Is not expected an error in this call!!!!
                expect(err).toEqual("Is not expected an error in this call!!!!")
                done();
            })

    }, 15000);

    test(`Workflow with $PropelCredentials Parameter, 2 credentials`, (done) => {

        let w = testingWorkflows.Workflow_S1Enabled2TargetsEnabledWithCredFast //With Credentials!
        let data: RunnerServiceData = new RunnerServiceData(w._id, [])

        //Adding an extra credential in the $PropelCredentials parameter value:
        w.steps[0].values[0].value += `, ${testingWorkflows.CredentialWindows03._id}`

        runner.execute(data, st)
            .then((msg: WebsocketMessage<ExecutionStats>) => {
                if (msg.context?.logId) {
                    expect(runner.executionLog?.status).toEqual(ExecutionStatus.Success);
                }
                else {
                    expect(msg.context?.logId).not.toBe(null);
                }

                done();
            })
            .catch((err) => {
                //IMPORTANT: Is not expected an error in this call!!!!
                expect(err).toEqual("Is not expected an error in this call!!!!")
                done();
            })

    }, 15000);

    test(`Workflow with Runtime Parameters - Sending the right runtime parameters.`, (done) => {

        let w = testingWorkflows.Workflow_S3EnabledWithParamsAndRuntimeParamsWithTargetNoThrowFastDuration
        //For this Workflow, the second step has 1st and 2nd parameters marked as runtime parameters:
        let rp1 = new RuntimeParameters()
        rp1.stepIndex = 1

        let rp1pv1 = new ParameterValue();
        rp1pv1.name = "NumericParam"
        rp1pv1.value = "100"
        rp1pv1.nativeType = JSType.Number
        rp1pv1.isRuntimeParameter = true

        let rp1pv2 = new ParameterValue();
        rp1pv2.name = "StringParam"
        rp1pv2.value = "Runtime value"
        rp1pv2.nativeType = JSType.String
        rp1pv2.isRuntimeParameter = true

        rp1.values = [rp1pv1, rp1pv2]

        let data: RunnerServiceData = new RunnerServiceData(w._id, [rp1])

        runner.execute(data, st)
            .then((msg: WebsocketMessage<ExecutionStats>) => {
                if (msg.context?.logId) {
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
                    expect(runner.executionLog?.executionSteps[1].status).toEqual(ExecutionStatus.Success);
                    expect(runner.executionLog?.executionSteps[1].targets.length).toEqual(1); 
                    expect(runner.executionLog?.executionSteps[1].targets[0].execErrors.length).toEqual(0);
                    expect(runner.executionLog?.executionSteps[1].targets[0].execResults.length).toBeGreaterThan(0);
                    expect(runner.executionLog?.executionSteps[1].targets[0].status).toEqual(ExecutionStatus.Success);

                    //3rd Step:
                    expect(runner.executionLog?.executionSteps[2].execError).toBe(null);
                    expect(runner.executionLog?.executionSteps[2].status).toEqual(ExecutionStatus.Success);
                    expect(runner.executionLog?.executionSteps[2].targets.length).toEqual(1); 
                    expect(runner.executionLog?.executionSteps[2].targets[0].execErrors.length).toEqual(0);
                    expect(runner.executionLog?.executionSteps[2].targets[0].execResults.length).toBeGreaterThan(0);
                    expect(runner.executionLog?.executionSteps[2].targets[0].status).toEqual(ExecutionStatus.Success);
                }
                else {
                    expect(msg.context?.logId).not.toBe(null);
                }

                done();
            })
            .catch((err) => {
                //IMPORTANT: Is not expected an error in this call!!!!
                expect(err).toEqual("Is not expected an error in this call!!!!")
                done();
            })

    }, 15000);

    test(`Workflow with Runtime Parameters - Sending no runtime parameters.`, (done) => {

        let w = testingWorkflows.Workflow_S3EnabledWithParamsAndRuntimeParamsWithTargetNoThrowFastDuration
        let data: RunnerServiceData = new RunnerServiceData(w._id, [])

        runner.execute(data, st)
            .then((msg: WebsocketMessage<ExecutionStats>) => {
                expect(msg.context?.logId).toEqual("newid")
                expect(msg.context?.logStatus).toEqual(ExecutionStatus.Faulty)
                done();
            })
            .catch((err) => {
                //Workflow must abort if at least one runtime parametrr is missing:
                expect(err).toEqual("Is not expected an error in this call!!!!")
                done();
            })

    }, 15000);
})