import { Code } from "./error-codes";

/**
 * Represents an error originated in the API. Extends native @class Error class. 
 * @extends Error
 */
export class PropelError extends Error {

    /**
     * Constructor
     * @param {Error | string} error Can be an error message or a native Error instance.
     * @param {Code} errorCode Is a Code error instance.
     */
    constructor(error: Error | string, errorCode?: Code) {

        if (!error) {
            throw new Error(`The APIError class constructor cannot receive null value in the "error" parameter. 
            Value provided was of type "${typeof error}", with value "${error}" `)
        } else if (!(typeof error == "object" || typeof error == "string")) {
            throw new Error(`APIError class constructor must receive an Error object or an error message in the "error" argument. 
            Value provided was of type "${typeof error}", with value "${error}" `)
        }

        super(((error as Error).message) ? (error as Error).message : String(error));
        
        if (error instanceof PropelError) {
            this.message = error.message;
            this.name = error.name;
            this.stack = error.stack;
            this.stackArray = error.stackArray;
            this.errorCode = error.errorCode;
        }
        else {
            if (errorCode && typeof errorCode != "object") {
                throw new Error(`APIError class constructor optional paramater "errorCode" requires a "Code" object. 
            Value provided was of type "${typeof errorCode}", with value "${errorCode}" `)
            }

            this.name = this.parseName(error);
            this.message = this.parseMessage(error);
            this.stack = this.parseStack(error);
            this.stackArray = this.parseStackArray(error);
            this.errorCode = this.parseErrorCode(errorCode);
        }
    }

    public readonly stackArray: string[];
    public readonly errorCode: Code;

    /**
     * Parse the name attribute of the error.
     * @param {Error | string} err Error message or original Error instance.
     */
    parseName(err: Error | string): string {
        let name = ((err as Error).name) ? (err as Error).name : "";
        return `PropelError${(name) ? " - " : ""}${name}`;
    }

    /**
     * Parse the message attribute of the error.
     * @param {Error | string} err Error message or original Error instance.
     */
    parseMessage(err: Error | string): string {
        return ((err as Error).message) ? (err as Error).message : String(err);
    }

    /**
     * Parse the stack and return it as a plain text.
     * If the err param is just an error message, we will get the actual stack as the property value.
     * @param {Error | string} err Error message or original Error instance.
     */
    parseStack(err: Error | string): string {
        let ret: string = ""

        if (typeof err == 'object' && err.stack) {
            ret = err.stack;
        }
        else {
            ret = (Error().stack) ? String(Error().stack) : "";
        }
        return ret;
    }

    /**
     * Parse the stack and turn it into a string[].
     * If the err param is just an error message, we will get the actual stack as the property value.
     * @param {Error | string} err Error message or original Error instance.
     */
    parseStackArray(err: Error | string): string[] {
        let ret: string[] = []
        let currentStack = this.parseStack(err);

        if (currentStack) {
            ret = currentStack
                .split('\n')
                .filter((line) => {
                    //Excluding first line and references to this module from the stack:
                    return !(line.startsWith("Error") || line.indexOf("api-error.") != -1)
                })
                .map((line) => line.trim());
        }

        return ret;
    }

    /**
     * Parse the standard API error code if any.
     * @param {Error | string} err Error message or original Error instance.
     */
    parseErrorCode(errorCode?: Code) {
        return (errorCode) ? errorCode : new Code();
    }
}
