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
            `At least one script parameter has set a wrong value for his type. 
This could happen when a script is updated with breaking changes. Please review and remediate the Workflow.`);
    }

    /**
     * If one script has an invalid default valu set for some of the parameters, this will be the 
     * returned error code.
     */
    static get InvalidDefaultParameterValue(): Code {
        return new Code("INVALID_PARAM_DEFAULT",
            `The value set as default in some of the script parameters is invalid.\r\n`,
            `At least one script parameter has an invalid default value set. Please check the ` +
            `values and ensure not having some of the following cases: A Boolean or Switch parameter ` +
            `with invalid default values. A Datetime parameter with a default value that is not in ` +
            `ISO-8601 format.`);
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
            `Incorrect definition for the $PropelCredentials parameter.`,
            `The $PropelCredentials parameter is managed by Propel and allows the script to access the required credentials.           
            The definition of this parameter is wrong. Please verify that : Type must be System.Object, it can't has a default value and also no ValidSet is allowed.`,
            false);
    }

    /**
     * Indicates an error when retrieveing or storing a Propel Secret.
     */
    static get CryptoError(): Code {
        return new Code("CRYPTO_ERROR",
            `Encryption or decryption of a database collection field failed. Possible cause: Change of Propel Encryption key in the configuration.`,
            `There was an error trying to encrypt or decrypt sensitive data in the database. 
Most likely cause, is you trying to fetch information encrypted with a different key than the actual. If you try to fetch information when this error happened, best course of action is to recreated the data.`,
            false);
    }

    /**
     * Indicates that during the login process the user wasn't found in Propel database.
     */
    static get LoginWrongUser(): Code {
        return new Code("LOGIN_WRONG_USER",
            `The user that try to login is not granted in Propel.`,
            `You have no permission to access this application yet. Please feel free to contact any Propel administrator about.`,
            false);
    }

    /**
     * Indicates that during the login process the user was prevented to login because was locked.
     */
    static get LoginLockedUser(): Code {
        return new Code("LOGIN_LOCKED_USER",
            `The user that try to login is locked.`,
            `Your user account is currently locked. Please contact any Propel administrator in order to unlock your account.`,
            false);
    }

    /**
     * Indicates that during the login process the user wasn't found in Propel database.
     */
    static get LoginWrongPassword(): Code {
        return new Code("LOGIN_WRONG_PASSWORD",
            `The user that try to login entered a wrong password.`,
            `The submitted password is wrong. In the case you forgot it, please contact any Propel administrator to reset it.`,
            false);
    }

    /**
     * Indicates the supplied authentication doesn't have the required format.
     */
    static get AuthCodeBadFormat(): Code {
        return new Code("AUTH_CODE_FORMAT",
            `The supplied authentication code doesn't meet the defined format.`,
            `Seems like the provided authentication code is not with the right format. Please verify the supplied code.`,
            false);
    }

    /**
     * Indicates the supplied authentication doesn't have the required format.
     */
    static get PasswordBadFormat(): Code {
        return new Code("PASSWORD_FORMAT",
            `The supplied password is not of the expected length.`,
            `The password you entered is too long or too short, please verify and try again.`,
            false);
    }

    /**
     * Indicates the supplied authentication doesn't have the required format.
     */
    static get UserImpersonation(): Code {
        return new Code("USER_IMPERSONATION_NOT_ALLOWED",
            `User impersonation not allowed in Propel.`,
            `You are not running Propel with the same credentials that you use to log to this machine. Please start Propel using your own credentials.`,
            false);
    }

    /**
     * Indicates the supplied access token is expired.
     */
    static get TokenIsExpired(): Code {
        return new Code("TOKEN_EXPIRED",
            `The supplied access token is expired.`,
            `Your session has expired. In order to protect your account you will need to login again.`,
            true);
    }

    /**
     * Indicates the supplied refresh token is missing or expired.
     */
    static get RefreshTokenIsExpired(): Code {
        return new Code("REFRESH_TOKEN_EXPIRED",
            `The refresh token is missing or expired.`,
            `A long time without using Propel?, please login again to protect your account.`,
            true);
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
