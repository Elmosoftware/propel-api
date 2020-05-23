// @ts-check
import express from "express";
import httpstatus from "http-status-codes";

import { Route } from "./route";
import { Runner } from "../services/runner-service";
import { logger } from "../services/logger-service";
import { APIResponse } from "../core/api-response";

import { Workflow } from "../../propel-shared/models/workflow";
import { ExecutionLog } from "../../propel-shared/models/execution-log";

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

        handler.get("", (req, res) => {
            res.status(httpstatus.BAD_REQUEST)
                .json(new APIResponse(`Parameter "workFlowId" is required.`, null));
        })
        
        handler.get("/:workFlowId", (req, res) => {

            res.setHeader('Content-Type', 'text/event-stream')
            res.setHeader('Cache-Control', 'no-cache')
            res.setHeader('Connection', 'keep-alive')
            res.setHeader("Access-Control-Allow-Origin", "*")
            
            /*
                TODO: Here is suppose you must go to the database to retrieve the 
                workflow with id: "workFlowId"
            */

            //==============================================================
            //For now, until we have UI advanced and some real data to test, We 
            //will use for this endpoint a fake Workflow:
            let TEST = new TestingWorkflows();
            let workflow: Workflow;

            //Uncomment below line to test with a Workflow that not throw errors and take 15sec to complete:
            workflow = TEST.Worflow_S1EnabledNoParamNoTargetNoThrowMediumDuration;
            //Uncomment below line to test with a workflow that throw an error:
            // workflow = TEST.Worflow_S1EnabledNoParamNoTargetThrow;
            //==============================================================

            let runner = new Runner();
            let subsCallback = (data: any) => {
                res.write(JSON.stringify(data));
            }

            runner.execute(workflow, subsCallback)
                .then((execLog: ExecutionLog) => {

                    /*
                        TODO: Here we will need to persist the Execution log.
                    */

                    res.write(JSON.stringify(new APIResponse(null, execLog)));
                    res.status(httpstatus.IM_A_TEAPOT)
                    .end();
                })
                .catch((err) => {
                    res.write(JSON.stringify(new APIResponse(err, null)));
                    res.status(httpstatus.INTERNAL_SERVER_ERROR)
                        .end();
                })

        })

        return handler;
    }
}
