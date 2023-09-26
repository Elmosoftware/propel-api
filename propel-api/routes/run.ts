// @ts-check
import express from "express";

import { Route } from "../core/route";
import { Runner } from "../services/runner-service";
import { ExecutionStats, WebsocketMessage, InvocationStatus } from "../../propel-shared/core/websocket-message";
import { logger } from "../services/logger-service";
import { Utils } from "../../propel-shared/utils/utils";
import { AuthStatus, RulePreventLogic, SecurityRule } from "../core/security-rule";
import { PropelError } from "../../propel-shared/core/propel-error";
import { REQUEST_TOKEN_KEY } from "../core/middleware";
import { SecurityToken } from "../../propel-shared/core/security-token";

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

        handler.ws("", (ws, req) => {
            logger.logInfo(`A new execution request for Workflow "${req.params.workFlowId}" has arrived.`);
            this.run(ws, req);
        })

        return handler;
    }

    async run(ws: any, req: express.Request): Promise<void> {
        let runner: Runner = new Runner();
        let token: SecurityToken = (req as any)[REQUEST_TOKEN_KEY];

        let subsCallback = (data: WebsocketMessage<ExecutionStats>) => {
            this.sendWebSocketMessage(ws, data);
        }
        try {

            ws.on('message', (message: string) => {
                if (!Utils.isValidJSON(message)) {
                    logger.logDebug(`Invalid message received: "${String(message)}"`)
                    return; //Disregard any non-JSON messages.
                } 
                
                let m: WebsocketMessage<ExecutionStats> = JSON.parse(message);
                logger.logInfo(`User sent action "${m.status}" during the execution of workflow with id "${req.params.workFlowId}".`);
                
                if (m.status == InvocationStatus.ServiceData) {
                    //We must discard any ServiceData message sent when the execution is in progress:
                    if (runner.currentStats.isRunning) return; 
                    logger.logInfo(`Receiving service data...`);

                    runner.execute(JSON.parse(m.message), token, subsCallback)
                        .then((msg: WebsocketMessage<ExecutionStats>) => {
                            logger.logInfo(`Execution of Workflow "${(msg.context?.workflowName) ? msg.context.workflowName: "Workflow name not available"}" is finished with status: "${msg.context?.logStatus}".`);
                            this.sendWebSocketMessage(ws, msg);
                        })
                        .catch((err) => {
                            logger.logInfo(`The Workflow execution finished with the following error: "${String(err)}".`);
                            this.sendWebSocketErrorMessage(ws, err as Error, runner!.currentStats);
                        })
                        .finally(() => {
                            ws.close()
                        })
                }
                else if (m.status == InvocationStatus.UserActionCancel) {
                    if (!runner.currentStats.isRunning) return; 
                    logger.logInfo(`Cancelling workflow execution before next step.`)
                    runner.cancelExecution();
                }
                else if (m.status == InvocationStatus.UserActionKill) {
                    if (!runner.currentStats.isRunning) return;
                    logger.logInfo(`Cancelling workflow execution immediately.`)
                    runner.cancelExecution(true);
                }
                else {
                    logger.logWarn(`Unknown user action, it will be ignored. Message received: "${message}".`);
                }
            });
        } catch (err) {
            logger.logError((err as Error));
            this.sendWebSocketErrorMessage(ws, err as Error, runner.currentStats)
            ws.close();
        }
    }

    sendWebSocketMessage(ws: any, message: WebsocketMessage<ExecutionStats>) {

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

    sendWebSocketErrorMessage(ws: any, error: Error, stats: ExecutionStats) {
        let e: PropelError = new PropelError(error);
        let msg = new WebsocketMessage<ExecutionStats>(InvocationStatus.Failed,
            (e.userMessage) ? e.userMessage : e.message, stats);
        this.sendWebSocketMessage(ws, msg)
    }

    getWebsocketStatusName(state: number): string {
        let s = {
            0: "CONNECTING",
            1: "OPEN",
            2: "CLOSING",
            3: "CLOSED"
        }
        return (s as any)[state] || "UNKNOWN";
    }
}
