// @ts-check
import express from "express";

import { Route } from "../core/route";
import { AuthStatus, RulePreventLogic, SecurityRule } from "../core/security-rule";
import { db } from "../core/database";
import { DataRequest, DataRequestAction } from "../../propel-shared/core/data-request";
import { DataService } from "../services/data-service";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "http-status-codes";
import { QueryModifier } from "../../propel-shared/core/query-modifier";
import { PropelError } from "../../propel-shared/core/propel-error";
import { Entity } from "../../propel-shared/models/entity";
import { logger } from "../services/logger-service";
import { UserAccountRoles } from "../../propel-shared/models/user-account-roles";
import { REQUEST_TOKEN_KEY } from "../core/middleware";
import { SecurityToken } from "../../propel-shared/core/security-token";
import { SecurityRuleInput } from "../core/security-rule-selector";
import { PagedResponse } from "../../propel-shared/core/paged-response";

/**
 * Data endpoint. Allows to manage all data operations for the API.
 * @implements Route.
 */
export class DataRoute implements Route {

    name: string = "Data";

    path: string = "/api/data";

    security: SecurityRule[] = [
        {
            matchFragment: "/script", 
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [AuthStatus.Anonymous],
            preventLogic: RulePreventLogic.Or,
            text: `This rule prevents anonymous users.`
        },
        {
            matchFragment: "/script", 
            matchMethods: [],
            preventDataActions: [DataRequestAction.Save, DataRequestAction.Delete],
            preventRoles: [UserAccountRoles.User],
            preventLogic: RulePreventLogic.And,
            text: `This rule prevents a regular user to Save or Delete Scripts in the Data API.`
        },
        {
            matchFragment: "/target", 
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [AuthStatus.Anonymous],
            preventLogic: RulePreventLogic.Or,
            text: `This rule prevents anonymous users.`
        },
        {
            matchFragment: "/target", 
            matchMethods: [],
            preventDataActions: [DataRequestAction.Save, DataRequestAction.Delete],
            preventRoles: [UserAccountRoles.User],
            preventLogic: RulePreventLogic.And,
            text: `This rule prevents anonymous or regular user to query Targets in the Data API.`
        },
        {
            matchFragment: "/credential", 
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [AuthStatus.Anonymous],
            preventLogic: RulePreventLogic.Or,
            text: `This rule prevents anonymous users.`
        },
        {
            matchFragment: "/credential", 
            matchMethods: [],
            preventDataActions: [DataRequestAction.Save, DataRequestAction.Delete],
            preventRoles: [UserAccountRoles.User],
            preventLogic: RulePreventLogic.And,
            text: `This rule prevents anonymous or regular users to query Credentials in the Data API.`
        },
        {
            matchFragment: "/workflow", 
            matchMethods: [],
            preventDataActions: [DataRequestAction.Save],
            preventRoles: [UserAccountRoles.User],
            preventCustom: (input: SecurityRuleInput) => {
                //Users can only create QuickTasks:
                return (input.body?.entity?.isQuickTask === false)
            },
            preventLogic: RulePreventLogic.And,
            text: `This rule prevents regular users to Save Workflows that are not Quick tasks in the Data API.`
        },
        {
            matchFragment: "/workflow", 
            matchMethods: [],
            preventDataActions: [DataRequestAction.Delete],
            preventRoles: [UserAccountRoles.User],
            preventLogic: RulePreventLogic.And,
            text: `This rule prevents regular users to Delete Workflows in the Data API.`
        },
        {
            matchFragment: "/workflow", 
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [AuthStatus.Anonymous],
            preventLogic: RulePreventLogic.Or,
            text: `This rule prevents Anonymus users to access Workflows in the Data API.`
        },
        {
            matchFragment: "/executionlog", 
            matchMethods: [],
            preventDataActions: [DataRequestAction.Delete],
            preventRoles: [AuthStatus.Anonymous, AuthStatus.Authenticated],
            preventLogic: RulePreventLogic.And,
            text: `This rule prevents any authenticated or anonymous users to Delete Execution logs using the Data API.`
        },
        {
            matchFragment: "/executionlog", 
            matchMethods: [],
            preventDataActions: [DataRequestAction.Save],
            preventRoles: [AuthStatus.Anonymous],
            preventLogic: RulePreventLogic.And,
            text: `This rule prevents anonymous users to Create or update entries in the Execution log through Data API.`
        },
        {
            matchFragment: "/useraccount", 
            matchMethods: [],
            preventDataActions: [DataRequestAction.Delete],
            preventRoles: [AuthStatus.Anonymous, AuthStatus.Authenticated],
            preventLogic: RulePreventLogic.And,
            text: `This rule prevents anyone to delete User accounts throught Data API.`
        },
        {
            matchFragment: "/useraccount", 
            matchMethods: [],
            preventDataActions: [DataRequestAction.Save, DataRequestAction.Find],
            preventRoles: [AuthStatus.Anonymous, UserAccountRoles.User],
            preventLogic: RulePreventLogic.And,
            text: `This rule prevents Anonymous or Regular users to View, Create or Modify User Accounts.`
        },
        {
            matchFragment: "/secret", 
            matchMethods: [],
            preventDataActions: [],
            preventRoles: [AuthStatus.Anonymous, UserAccountRoles.User],
            preventLogic: RulePreventLogic.Or,
            text: `This rule prevents anonymous users to access Propel Secrets.`
        },
        {
            matchFragment: "/session", 
            matchMethods: [],
            preventDataActions: [DataRequestAction.Delete],
            preventRoles: [AuthStatus.Anonymous, AuthStatus.Authenticated],
            preventLogic: RulePreventLogic.And,
            text: `This rule prevents anyone to delete User sessions throught Data API.`
        }
    ]

    constructor() {
        logger.logDebug(`Creating route ${this.name} with path ${this.path}"`)
    }

    handler(): express.Router {

        const handler = express.Router();

        handler.post("/*", (req, res) => {
            //Creating the service instance:
            let entityName = req.url.slice(req.url.startsWith("/") ? 1 : 0);
            let svc: DataService;
            let body: DataRequest;
            let e: PropelError | null = null;
            let result$: Promise<any> | null = null;
            let token: SecurityToken = (req as any)[REQUEST_TOKEN_KEY];

            try {
                svc = db.getService(entityName, token);
                body = req.body;

                if (body && body.action) {
                    switch (body.action) {
                        case DataRequestAction.Find:
                            result$ = this.processFind(body, svc);
                            break;
                        case DataRequestAction.Save:
                            result$ = this.processSave(body, svc);
                            break;
                        case DataRequestAction.Delete:
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
                    res.status(BAD_REQUEST).json(e);
                }
                else if (result$) {
                    result$
                        .then((result: any) => {
                            res.json(result);
                        })
                        .catch((error) => {
                            res.status(BAD_REQUEST).json(error);
                        });
                }
            } catch (error) {
                res.status(INTERNAL_SERVER_ERROR).json(error);
            }
        });

        return handler;
    }

    processFind(body: DataRequest, svc: DataService): Promise<PagedResponse<Entity>> {
        let e: PropelError | null = null;
        let ret$: Promise<PagedResponse<Entity>>;

        if (body.entity) {
            //An string entity is an entity ID. So, if valid, we will create 
            //the Query Modifier accordingly:
            if (typeof body.entity == "string") {
                if (DataService.isValidObjectId(body.entity)) {
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
            ret$ = Promise.reject(e);
        }
        else {
            ret$ = svc.find(new QueryModifier(body.qm));
        }

        return ret$;
    }

    processSave(body: DataRequest, svc: DataService): Promise<string> {
        let e: PropelError | null = null;
        let ret$: Promise<string>;

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
            ret$ = Promise.reject(e);
        }

        return ret$
    }

    processDelete(body: DataRequest, svc: DataService): Promise<string> {
        let e: PropelError | null = null;
        let ret$: Promise<string>;

        if (body.entity) {
            ret$ = svc.delete(((body.entity as Entity)._id) ? (body.entity as Entity)._id : String(body.entity));
        }
        else {
            e = new PropelError(`Delete action was aborted because the body doesn't contain an entity object. ApiRequest object sent "${JSON.stringify(body)}"`)
            ret$ = Promise.reject(e);
        }

        return ret$
    }
}