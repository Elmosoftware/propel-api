// @ts-check
import express from "express";

import { Route } from "./route";
import { db } from "../core/database";
import { APIRequest, APIRequestAction } from "../../propel-shared/core/api-request";
import { DataService } from "../services/data-service";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "http-status-codes";
import { APIResponse } from "../../propel-shared/core/api-response";
import { QueryModifier } from "../../propel-shared/core/query-modifier";
import { PropelError } from "../../propel-shared/core/propel-error";
import { Entity } from "../../propel-shared/models/entity";

/**
 * Data endpoint. Allows to manage all data operations for the API.
 * @implements Route.
 */
export class DataRouter implements Route {

    constructor() {
    }

    route(): express.Router {

        const handler = express.Router();

        handler.post("/*", (req, res) => {
            //Creating the service instance:
            let entityName = req.url.slice(req.url.startsWith("/") ? 1 : 0);
            let svc: DataService;
            let body: APIRequest;
            let e: PropelError | null = null;
            let result$: Promise<APIResponse<any>> | null = null;

            try {
                svc = db.getService(entityName);
                body = req.body;

                if (body && body.action) {
                    switch (body.action) {
                        case APIRequestAction.Find:
                            result$ = this.processFind(body, svc);
                            break;
                        case APIRequestAction.Save:
                            result$ = this.processSave(body, svc);
                            break;
                        case APIRequestAction.Delete:
                            result$ = this.processDelete(body, svc);
                            break;
                        default:
                            e = new PropelError(`Unknown action submitted. Action name: "${body.action}"`);
                    }
                }
                else {
                    e = new PropelError(`No body sent! What I'm supposed to do?.`)
                }

                if (e) {
                    res.status(BAD_REQUEST).json(new APIResponse(e, null));
                }
                else if (result$) {
                    result$
                        .then((result: APIResponse<any>) => {
                            res.json(result);
                        })
                        .catch((result: APIResponse<any>) => {
                            res.status(BAD_REQUEST).json(result);
                        });
                }
            } catch (error) {
                res.status(INTERNAL_SERVER_ERROR).json(new APIResponse<any>(error, null));
            }
        });

        return handler;
    }

    processFind(body: APIRequest, svc: DataService): Promise<APIResponse<any>> {
        let e: PropelError | null = null;
        let ret$: Promise<APIResponse<any>>;

        if (body.entity) {
            //An string entity is an entity ID. So, if valid, we will create 
            //the Query Modifier accordingly:
            if (typeof body.entity == "string") {
                if (svc.isValidObjectId(body.entity)) {
                    if (!body.qm) {
                        body.qm = new QueryModifier();
                    }                    
                    body.qm.filterBy = { _id: body.entity };
                }
                else {
                    e = new PropelError(`The id specified is not a valid identifier. Specified ID:"${JSON.stringify(body.entity)}", ID type is:"${typeof body.entity}" Expected type is "string".`);
                }
            }
            else {
                e = new PropelError(`Find action was aborted because the body entity attribute is not a string, (we expect an entity ID). Supplied value: "${JSON.stringify(body.entity)}"`);
            }
        }

        if (e) {
            ret$ = Promise.reject(new APIResponse<any>(e, null));
        }
        else {
            ret$ = svc.find(body.qm);
        }

        return ret$;
    }

    processSave(body: APIRequest, svc: DataService): Promise<APIResponse<any>> {
        let e: PropelError | null = null;
        let ret$: Promise<APIResponse<any>>;

        if (body.entity && typeof body.entity == "object") {
            if (body.entity._id) {
                ret$ = svc.update(body.entity)
            }
            else {
                ret$ = svc.add(body.entity);
            }
        }
        else {
            e = new PropelError(`Save action was aborted because the body doesn't contain an entity object. ApiRequest object sent "${JSON.stringify(body)}"`)
            ret$ = Promise.reject(new APIResponse<any>(e, null));
        }

        return ret$
    }

    processDelete(body: APIRequest, svc: DataService): Promise<APIResponse<any>> {
        let e: PropelError | null = null;
        let ret$: Promise<APIResponse<any>>;

        if (body.entity) {
            ret$ = svc.delete(((body.entity as Entity)._id) ? (body.entity as Entity)._id : String(body.entity));
        }
        else {
            e = new PropelError(`Delete action was aborted because the body doesn't contain an entity object. ApiRequest object sent "${JSON.stringify(body)}"`)
            ret$ = Promise.reject(new APIResponse<any>(e, null));
        }

        return ret$
    }
}