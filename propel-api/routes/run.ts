// @ts-check
import express from "express";

import { Route } from "./route";
import { Runner } from "../services/runner-service";
import { APIResponse } from "../core/api-response";
import { Workflow } from "../../propel-shared/models/workflow";
import { InvocationMessage, InvocationStatus } from "../../propel-shared/core/invocation-message";
import { logger } from "../../propel-shared/services/logger-service";
import { Utils } from "../../propel-shared/utils/utils";

//==============================================================
//REMOVE THIS AS SOON THE UI is ready:
import { TestingWorkflows } from "../test/services/testing-workflows";
//==============================================================

/**
 * Run endpoint. This receives a Workflowid, takes care of the execution and returns the 
 * corresponding ExecutionLog ID.
 * @implements Route.
 */
export class RunRouter implements Route {

    constructor() {
    }

    route(): express.Router {

        const handler = express.Router();

        handler.ws("/:workFlowId", (ws, req) => {

            /*
                TODO: Here is suppose you must go to the database to retrieve the 
                workflow with id: "workFlowId"
            */

            //==============================================================
            //For now, until we have UI advanced and some real data to test, We 
            //will use for this endpoint a fake Workflow:
            let TEST = new TestingWorkflows();
            let workflow: Workflow;

            //Uncomment below line to test with a Workflow that not throw errors, have a single step
            //and take 15sec to complete:
            // workflow = TEST.Worflow_S1EnabledNoParamNoTargetNoThrowMediumDuration;
            //Uncomment below line to test with a Workflow that not throw errors, have 2 steps
            //and take 30sec to complete:
            workflow = TEST.Worflow_S2EnabledNoParamNoTargetNoThrowMediumDuration;
            //Uncomment below line to test with a workflow that throw an error:
            //workflow = TEST.Worflow_S1EnabledNoParamNoTargetThrow;
            //==============================================================

            let runner = new Runner();
            let subsCallback = (data: any) => {
                ws.send(JSON.stringify(data));
            }

            runner.execute(workflow, subsCallback)
                .then((msg: InvocationMessage) => {

                    /*
                        TODO: Here we will need to persist the Execution log.
                    */

                    ws.send(JSON.stringify(msg));
                })
                .catch((err) => {
                    ws.send(JSON.stringify(new APIResponse(err, null)));
                })
                .finally(() => {
                    ws.close()
                })

                ws.on('message', (message: string) => {
                    //Disregard any non-JSON message:
                    if (!Utils.isValidJSON(message)) return;

                    let m: InvocationMessage = JSON.parse(message);
                    logger.logInfo(`User sent action "${m.status}" during the execution of workflow "${workflow._id}".`);

                    if (m.status == InvocationStatus.UserActionCancel) {
                        logger.logInfo(`Cancelling workflow execution before next step.`)
                        runner.cancelExecution();
                    }
                    else if (m.status == InvocationStatus.UserActionKill) {
                        logger.logInfo(`Cancelling workflow execution immediattely.`)
                        runner.cancelExecution(true);
                    }
                    else {
                        logger.logWarn(`Unknown user action, it will be ignored.`);
                    }
                });
        })

        return handler;
    }
}
