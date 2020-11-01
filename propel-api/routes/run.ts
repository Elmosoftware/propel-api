// @ts-check
import express from "express";

import { Route } from "./route";
import { Runner } from "../services/runner-service";
import { db } from "../core/database";
import { DataService } from "../services/data-service";
import { APIResponse } from "../../propel-shared/core/api-response";
import { Workflow } from "../../propel-shared/models/workflow";
import { InvocationMessage, InvocationStatus } from "../../propel-shared/core/invocation-message";
import { logger } from "../services/logger-service";
import { Utils } from "../../propel-shared/utils/utils";
import { QueryModifier } from "../../propel-shared/core/query-modifier";

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

            let workflow: Workflow;
            let runner: Runner;
            let svc: DataService = db.getService("workflow");
            let qm = new QueryModifier();

            qm.filterBy = { _id: req.params.workFlowId };

            //First, we find the Workflow: 
            svc.find(qm)
                .then((data: APIResponse<Workflow>) => {
                    workflow = data.data[0];

                    runner = new Runner();
                    let subsCallback = (data: any) => {
                        ws.send(JSON.stringify(data));
                    }

                    //Starting the execution:
                    logger.logDebug(`Starting execution of Workflow "${(workflow.name) ? workflow.name : "name unavailable" }" with id: "${workflow._id}".`)
                    runner.execute(workflow, subsCallback)
                        .then((msg: InvocationMessage) => {
                            logger.logDebug(`Execution of Workflow "${(workflow.name) ? workflow.name : "name unavailable" }" is finished, Status is "${msg.logStatus}".`);
                            ws.send(JSON.stringify(msg));
                        })
                        .catch((err) => {
                            logger.logDebug(`Execution of Workflow "${(workflow.name) ? workflow.name : "name unavailable" }" finished with the following error: "${String(err)}".`);
                            ws.send(JSON.stringify(new APIResponse(err, null)));
                        })
                        .finally(() => {
                            ws.close()
                        })

                    ws.on('message', (message: string) => {
                        //Disregard any non-JSON messages:
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
                            logger.logWarn(`Unknown user action, it will be ignored. Message received: "${message}".`);
                        }
                    });
                })
                .catch((err) => {
                    logger.logError(err);
                    ws.send(JSON.stringify(new APIResponse(err, null)));
                    ws.close();
                });
        })

        return handler;
    }
}
