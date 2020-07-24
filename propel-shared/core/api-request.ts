import { QueryModifier } from "./query-modifier";
import { Entity } from "../models/entity";

export class APIRequest {

    /**
     * Action to request.
     */
    action: APIRequestAction = APIRequestAction.Find;

    /**
     * QueryModifier instance, applies only to a APIRequestAction.Find. 
     */
    qm?: QueryModifier;

    /**
     * For different actions this attribute have different roles:
     *  - For a "find" action: This can be the document ID to retrieve. If that's the case any 
     * filter specified in the "qm" attribute will be ignored.
     *  - For a "save" action: The document to save or update. If the document already have an "_id" 
     * property with value, the derived action will be an update to the repository, otherwise it will 
     * be an insert.
     *  - For a "delete" action: The document to delete or just a string representing the document 
     * unique identifier.
     */
    entity?: Entity | string;

    constructor() {
    }
}

/**
 * Possible actions for a request to the Data API:
 */
export enum APIRequestAction {
    /**
     * Save or update the supplied entity document.
     */
    Save = "save",

    /**
     * Find one or many documents, based on the supplied query modifiers.
     */
    Find = "find",

    /**
     * Delete thespecified document.
     */
    Delete = "delete"
}
