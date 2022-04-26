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
    constructor(error: Error | string, errorCode?: Code, httpStatus?: string) {

        // super(((error as Error).message) ? (error as Error).message : String(error));
        super((error) ? String(error) : "");

        const MIN_HTTPSTATUS: number = 100 //First valid HTTP status code.
        const MAX_HTTPSTATUS: number = 599 //Last valid HTTP status code.
        
        if (!error) {
            throw new Error(`The PropelError class constructor cannot receive null value in the "error" parameter. 
            Value provided was of type "${typeof error}", with value "${error}" `)
        } else if (!(typeof error == "object" || typeof error == "string")) {
            throw new Error(`PropelError class constructor must receive an Error object or an error message in the "error" argument. 
            Value provided was of type "${typeof error}", with value "${error}" `)
        }

        if (typeof error != "string" && (error instanceof PropelError || error.name == "PropelError")) {
            this.message = error.message;
            this.name = error.name;
            this.stack = error.stack;
            if ((error as PropelError).stackArray) {
                this.stackArray = (error as PropelError).stackArray;
            }
            else {
                this.stackArray = [];
            }

            if ((error as PropelError).errorCode) {
                this.errorCode = (error as PropelError).errorCode;
            }

            if ((error as PropelError).httpStatus) {
                this.httpStatus = (error as PropelError).httpStatus;
            }  
        }
        else {
            if (errorCode && typeof errorCode != "object") {
                throw new Error(`PropelError class constructor optional paramater "errorCode" requires a "Code" object. 
                Value provided was of type "${typeof errorCode}", with value "${errorCode}" `)
            }

            if (!(httpStatus === null || httpStatus === undefined || httpStatus == "")) {
                if (isNaN(parseInt(httpStatus))) {
                    throw new Error(`PropelError class constructor optional paramater "httpStatus" requires a numeric value. 
                Value provided was of type "${typeof httpStatus}", with value "${httpStatus}" `)
                }
                else if (parseInt(httpStatus) < MIN_HTTPSTATUS || parseInt(httpStatus) > MAX_HTTPSTATUS) {
                    throw new Error(`PropelError class constructor optional paramater "httpStatus" requires a valid HTTP status code.
                Status code must be greater or equal to ${MIN_HTTPSTATUS.toString()} and less than or equal to ${MAX_HTTPSTATUS.toString()}.
                Value provided was of type "${typeof httpStatus}", with numeric value "${parseInt(httpStatus).toString()}" `)
                }
            }
            this.name = this.parseName(error);
            this.message = this.parseMessage(error);
            this.stack = this.parseStack(error);
            this.stackArray = this.parseStackArray(error);
            this.errorCode = this.parseErrorCode(errorCode);
            this.httpStatus = this.parseHTTPStatus(httpStatus)

            //We don't want to duplicate data, so if the stackArray is filled, there is no need 
            //for the stack:
            if (this.stackArray.length !== 0) {
                this.stack = "";
            }
        }
    }

    /**
     * A better way to see the stack calls.
     */
    public readonly stackArray: string[];

    /**
     * One of the define Propel Error codes
     */
    public readonly errorCode!: Code;

    /**
     * If the error is XHR based, is the HTTP status returned by the call.
     */
    public httpStatus: string = "";

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
            ret = String((new Error()).stack);
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
                    return !(line.startsWith("Error") || line.indexOf("PropelError") != -1)
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

    /**
     * Parse the HTTP status.
     * @param {string | undefined} httpStatus Error message or original Error instance.
     */
    parseHTTPStatus(httpStatus?: string | undefined): string {
        return (httpStatus === null || httpStatus === undefined || httpStatus == "") ? "" : parseInt(httpStatus).toString();
    }
}
