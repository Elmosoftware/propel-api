import { testingWorkflows } from "./testing-workflows";
import { pool } from "../../services/invocation-service-pool";
import { Runner } from "../../services/runner-service";
import { ExecutionStatus } from "../../../propel-shared/models/execution-status";
import { InvocationMessage } from "../../../propel-shared/core/invocation-message";
import { ExecutionLog } from "../../../propel-shared/models/execution-log";
import { APIResponse } from "../../../propel-shared/core/api-response";
import { Secret } from "../../../propel-shared/models/secret";
import { SecretValue } from "../../../propel-shared/models/secret-value";
import { Credential } from "../../../propel-shared/models/credential";
import { LogLevel } from "../../core/config";
import { SecurityToken } from "../../../propel-shared/core/security-token";
import { DataService } from "../../services/data-service";

let runner: Runner;

afterAll(() => {
    pool.disposeSync();
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
        
        runner = new Runner();
        runner.saveExecutionLog = (log: ExecutionLog) => {
            return Promise.resolve(new APIResponse<string>(null, "newid"));
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

        let w = testingWorkflows.Worflow_S1EnabledNoParamNoTargetNoThrow;

        runner.execute(w, st)
            .then((msg: InvocationMessage) => {
                if (msg.logId) {
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

        runner.execute(w, st)
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

        runner.execute(w, st)
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

        runner.execute(w, st)
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
        runner.execute(w, st)
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

        runner.execute(w, st)
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

        runner.execute(w, st)
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

    test(`Workflow with $PropelCredentials Parameter, 1 single credential`, (done) => {

        let w = testingWorkflows.Worflow_S1Enabled2TargetsEnabledWithCredFast //With Credentials!

        runner.execute(w, st)
            .then((msg: InvocationMessage) => {
                if (msg.logId) {
                    expect(runner.executionLog?.status).toEqual(ExecutionStatus.Success);
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

    test(`Workflow with $PropelCredentials Parameter, 2 credentials`, (done) => {

        let w = testingWorkflows.Worflow_S1Enabled2TargetsEnabledWithCredFast //With Credentials!

        //Adding an extra credential in the $PropelCredentials parameter value:
        w.steps[0].values[0].value += `, ${testingWorkflows.CredentialWindows03._id}`

        runner.execute(w, st)
            .then((msg: InvocationMessage) => {
                if (msg.logId) {
                    expect(runner.executionLog?.status).toEqual(ExecutionStatus.Success);
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