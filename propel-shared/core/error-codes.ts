//@ts-check

/**
 * Standard API error codes.
 * These are not HTTP codes, but codes that reflect specific errors which root cause was identified 
 * so can be treated in the UI. 
 */
export class ErrorCodes {

    /**
     * The user attempts to insert or update data in such a way that results on creating a duplicate key 
     * in the database.
     */
    static get DuplicatedItem(): Code {
        return new Code("DUP_ITEM",
            "The user attempts to insert or update data in such a way that results on creating a duplicate key in the database Storage.",
            "The item already exist! Please review the form data.");
    }

    /**
     * The user try to update an entity that no longer exists or is forbidden. So the operation 
     * hits no documents.
     */
    static get VoidUpdate(): Code {
        return new Code("VOID_UPDATE",
            "The user try to update an entity that no longer exists or is forbidden. So the operation hits no documents.",
            "The item you try to update no longer exists. Please refresh the page before retrying.");
    }

    /**
     * The user try to delete an entity that no longer exists or is forbidden. So the operation 
     * hits no documents.
     */
    static get VoidDelete(): Code {
        return new Code("VOID_DELETE",
            "The user try to delete an entity that no longer exists or is forbidden. So the operation hits no documents.",
            "The item you try to delete no longer exists. Please refresh the page before retrying.");
    }

    /**
     * The user try to delete an entity that no longer exists or is forbidden. So the operation 
     * hits no documents.
     */
    static get QueueOverflow(): Code {
        return new Code("QUEUE_OVERFLOW",
            "The implemented Object pool queue is overflow. An object pool is defined for the InvocationService so, this issue caused when all the objects in the pool are in use and also the queued request collection reach his maximum size. \r\nNew Requests will be dropped until there is enough space in the queue.",
            "System capacity is full, please check the system stats and retry later.");
    }

    /**
     * The user invocate a workflow or task that has incorrect and/or missing parameters and need
     *  to be remediated.
     */
    static get WrongParameterData(): Code {
        return new Code("WRONG_PARAM_DATA",
            `The supplied value for at least one of the script parameters are inconsistent with his data type or the validation rules set in the parameter definition. This normally happen when a script is updated with breaking changes.
Please check if the workflow need to be remediated in order to supply the right values.`,
        `AT least one script parameter has set a wrong value for his type. 
This could happen when a script is updated with breaking changes. Please review and remediate the Workflow.`);
    }

    /**
     * Saving some log information failed. This is not critical.
     */
    static get saveLogFailed(): Code {
        return new Code("SAVE_LOG_FAILED",
            `An error prevent the log information to be saved, but the underlying operation was completed. This is not critical.`,
            `Some issue prevent the log to be saved, but the operation was able to complete. Please contact the site administrator about this.`,
            true);
    }

    /**
     * This code indicates that in the inference process, a Propel parameter, (as defined in 
     * the PS_SCRIPT_PROPEL_PARAM environment value) was found but his definition was incorrect.
     */
    static get WrongPropelParameter(): Code {
        return new Code("WRONG_PROPEL_PARAM",
            `Incorrect definition for the $Propel parameter.`,
            `The $Propel parameter is managed by Propel and allows the script to take some context information related to the execution like the remote target details, etc.           
            The definition of this parameter is wrong. Please verify: Type must be System.Object and no ValidSet is allowed.`,
            false);
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
    constructor(key: string = "", description: string = "", userMessage: string = "", isWarning: boolean = false) {
        this.key = key;
        this.description = description;
        this.userMessage = userMessage;
        this.isWarning = isWarning;
    }

    public readonly key: string;
    public readonly description: string;
    public readonly userMessage: string;
    public readonly isWarning: boolean;
}
