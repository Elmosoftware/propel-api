// @ts-check
import express from "express";

import { Route } from "../core/route";
import { Runner } from "../services/runner-service";
import { db } from "../core/database";
import { DataService } from "../services/data-service";
import { APIResponse } from "../../propel-shared/core/api-response";
import { Workflow } from "../../propel-shared/models/workflow";
import { ExecutionStats, WebsocketMessage, InvocationStatus } from "../../propel-shared/core/websocket-message";
import { logger } from "../services/logger-service";
import { Utils } from "../../propel-shared/utils/utils";
import { QueryModifier } from "../../propel-shared/core/query-modifier";
import { AuthStatus, RulePreventLogic, SecurityRule } from "../core/security-rule";
import { PropelError } from "../../propel-shared/core/propel-error";
import { REQUEST_TOKEN_KEY } from "../core/middleware";
import { SecurityToken } from "../../propel-shared/core/security-token";
import { PagedResponse } from "../../propel-shared/core/paged-response";

/**
 * Run endpoint. This receives a Workflowid, takes care of the execution and returns the 
 * corresponding ExecutionLog ID.
 * @implements Route.
 */
export class RunRoute implements Route {

    name: string = "Run";

    path: string = "/api/run";

    security: SecurityRule[] = [
        {
            matchFragment: "/*",
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [AuthStatus.Anonymous],
            preventLogic: RulePreventLogic.Or,
            text: `This rule prevents anonymous users to run Quick Tasks or Workflows.`
        }
    ];

    constructor() {
        logger.logDebug(`Creating route ${this.name} with path "${this.path}"`)
    }

    handler(): express.Router {

        const handler = express.Router();

        handler.ws("/:workFlowId", (ws, req) => {
            logger.logInfo(`A new execution request for Workflow "${req.params.workFlowId}" has arrived.`);
            this.run(ws, req);
        })

        return handler;
    }

    async run(ws: any, req: express.Request): Promise<void> {

        let workflow: Workflow | undefined;
        let runner: Runner;
        let token: SecurityToken = (req as any)[REQUEST_TOKEN_KEY];

        let subsCallback = (data: any) => {
            this.sendWebSocketMessage(ws, data);
        }

        try {
            logger.logDebug(`Retrieving now Workflow details...`);
            workflow = await this.getWorkflow(req.params.workFlowId, token);

            //If the Workflow is missing/deleted, we are not able to proceed.
            if (!workflow) throw new PropelError("The workflow does not exists. Please verify if it was deleted before retrying.");

            logger.logInfo(`Starting execution of Workflow "${(workflow?.name) ? workflow.name : "deleted workflow"}" with id: "${req.params.workFlowId}".`)

            runner = new Runner();
            runner.execute(workflow, token, subsCallback)
                .then((msg: WebsocketMessage<ExecutionStats>) => {
                    logger.logInfo(`Execution of Workflow "${(workflow?.name) ? workflow.name : `with id "${req.params.workFlowId}"`}" is finished with status: "${msg.context?.logStatus}".`);
                    // ws.send(JSON.stringify(msg));
                    this.sendWebSocketMessage(ws, msg);
                })
                .catch((err) => {
                    logger.logInfo(`Execution of Workflow "${(workflow?.name) ? workflow.name : `with id "${req.params.workFlowId}"`}" finished with the following error: "${String(err)}".`);
                    // ws.send(JSON.stringify(new APIResponse(err, null)));
                    this.sendWebSocketMessage(ws, new APIResponse(err, null));
                })
                .finally(() => {
                    ws.close()
                })

            ws.on('message', (message: string) => {
                //Disregard any non-JSON messages:
                if (!Utils.isValidJSON(message)) return;

                let m: WebsocketMessage<ExecutionStats> = JSON.parse(message);
                logger.logInfo(`User sent action "${m.status}" during the execution of workflow with id "${req.params.workFlowId}".`);

                if (m.status == InvocationStatus.UserActionCancel) {
                    logger.logInfo(`Cancelling workflow execution before next step.`)
                    runner.cancelExecution();
                }
                else if (m.status == InvocationStatus.UserActionKill) {
                    logger.logInfo(`Cancelling workflow execution immediately.`)
                    runner.cancelExecution(true);
                }
                else {
                    logger.logWarn(`Unknown user action, it will be ignored. Message received: "${message}".`);
                }
            });
        } catch (err) {
            logger.logError((err as Error));
            ws.send(JSON.stringify(new APIResponse(err, null)));
            ws.close();
        }
    }

    private async getWorkflow(id: string, token: SecurityToken): Promise<Workflow | undefined> {
        let svc: DataService = db.getService("workflow", token);
        let result: PagedResponse<Workflow>;
        let qm = new QueryModifier();

        qm.filterBy = { _id: id };

        try {
            result = await svc.find(qm) as PagedResponse<Workflow>;
        } catch (error) {
            return Promise.reject(error)
        }

        return Promise.resolve(result.data[0]);
    }

    sendWebSocketMessage(ws: any, message: any) {

        if (ws.readyState !== ws.OPEN) {
                logger.logWarn(`A message was sent when the socket is not opened. 
This is mostly caused by the user closing the app or browser. Message will be disregard, but the execution will continue.
Current websocket status is: "${this.getWebsocketStatusName(ws.readyState)}".
Message was: "${JSON.stringify(message)}".`)
        }
        else {
            ws.send(JSON.stringify(message));
        }
    }

    getWebsocketStatusName(state: number):string {
        let s = {
            0: "CONNECTING",
            1: "OPEN",
            2: "CLOSING",
            3: "CLOSED"
        }
        return (s as any)[state] || "UNKNOWN";
    }
}
