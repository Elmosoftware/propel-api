//@ts-check

/**
 * Standard API error codes.
 * These are not HTTP codes, but codes that reflect specific errors which root cause was identified 
 * so can be treated in the UI. 
 */
export class StandardCodes {

    /**
     * The user attempts to insert or update data in such a way that results on creating a duplicate key 
     * in the database.
     */
    static get DuplicatedItem(): Code {
        return new Code("DUP_ITEM",
            "The user attempts to insert or update data in such a way that results on creating a duplicate key in the database Storage.");
    }

    /**
     * The user try to update an entity that no longer exists or is forbidden. So the operation 
     * hits no documents.
     */
    static get VoidUpdate(): Code {
        return new Code("VOID_UPDATE",
            "The user try to update an entity that no longer exists or is forbidden. So the operation hits no documents.");
    }

    /**
     * The user try to delete an entity that no longer exists or is forbidden. So the operation 
     * hits no documents.
     */
    static get VoidDelete(): Code {
        return new Code("VOID_DELETE",
            "The user try to delete an entity that no longer exists or is forbidden. So the operation hits no documents.");
    }

    /**
     * The user try to delete an entity that no longer exists or is forbidden. So the operation 
     * hits no documents.
     */
    static get QueueOverflow(): Code {
        return new Code("QUEUE_OVERFLOW",
            "The implemented Object pool queue is overflow. An object pool is defined for the InvocationService so, this issue caused when all the objects in the pool are in use and also the queued request collection reach his maximum size. \nNew Requests will be dropped until there is enough space in the queue.");
    }

    /**
     * The user invocate a workflow or task that has incorrect and/or missing parameters and need
     *  to be remediated.
     */
    static get WrongParameterData(): Code {
        return new Code("WRONG_PARAM_DATA",
            `The supplied value for at least one of the script parameters are inconsistent with his data type or the validation rules set in the parameter definition. This normally happen when a script is updated with breaking changes.
Please check if the workflow need to be remediated in order to supply the right values.`);
    }
}

/**
 * Represnts one error code having a unique Key and a generic error description.
 */
export class Code {
    /**
     * Represents a identified error root cause.
     * @param {string} key Unique error code
     * @param {string} description Error description 
     */
    constructor(key = "", description = "") {
        this.key = key;
        this.description = description
    }

    public readonly key: string;
    public readonly description: string;
}
