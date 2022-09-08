import { DataEndpointActions } from "src/services/data.service";
import { PropelError } from "../../../../propel-shared/core/propel-error";

/**
 * Search types defined.
 * IMPORTANT NOTE: They must match in count and order with the tabs in the component.
 */
export enum SearchType {
    Workflows = "workflows",
    Scripts = "scripts",
    Targets = "targets",
    Credentials = "credentials",
    UserAccounts = "useraccounts"
}

export const DEFAULT_SEARCH_TYPE: SearchType = SearchType.Workflows;

export class SearchTypeDefinition {
    constructor() {
    }

    private static _def = {
        workflows: {
            //Add here the fields indicated in the full text search index in the database.
            //Put them sorted by weight index: 
            textFields: [
                "name",
                "description"
            ],
            dataEntity: DataEndpointActions.Workflow,
            defaultSort: "name",
            additionalFilter: {
                //We would like to exclude Quick tasks from the list:
                isQuickTask: { 
                $eq: false
              }}
        },
        scripts: {
            textFields: [
                "name",
                "description"
            ],
            dataEntity: DataEndpointActions.Script,
            defaultSort: "name",
            additionalFilter: {
            }
        },
        targets: {
            textFields: [
                "friendlyName",
                "description"
            ],
            dataEntity: DataEndpointActions.Target,
            defaultSort: "friendlyName",
            additionalFilter: {
            }
        },
        credentials: {
            textFields: [
                "name",
                "description"
            ],
            dataEntity: DataEndpointActions.Credential,
            defaultSort: "name",
            additionalFilter: {
            }
        },
        useraccounts: {
            textFields: [
                "fullName",
                "name",
                "email"
            ],
            dataEntity: DataEndpointActions.UserAccount,
            defaultSort: "name",
            additionalFilter: {
            }
        }
    }

    static getFullTextFields(type: SearchType): string[] {
        return this.getAttribute(type, "textFields");
    }

    static getDataEntity(type: SearchType): DataEndpointActions {
        return this.getAttribute(type, "dataEntity");
    }

    static getDefaultSort(type: SearchType): string {
        return this.getAttribute(type, "defaultSort");
    }

    static getAdditionalFilterConditions(type: SearchType): string {
        return this.getAttribute(type, "additionalFilter");
    }

    private static getAttribute(type: SearchType, attr: string): any {

        let ret: string;

        if(this._def[type]) {
            ret = this._def[type][attr];
        }
        else {
            throw new PropelError(`There is no search type define with name ${type}`)
        }

        return ret;
    }
}