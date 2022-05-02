import { Code } from "./error-codes";

const MIN_HTTPSTATUS: number = 100 //First valid HTTP status code.
const MAX_HTTPSTATUS: number = 599 //Last valid HTTP status code.
const PROPEL_ERROR_NAME: string = "PropelError"

/**
 * Represents an error originated in the API. Extends native @class Error class. 
 */
export class PropelError {

    /**
     * A better way to see the stack calls.
     */
    public stackArray: string[] = [];

    /**
     * One of the define Propel Error codes
     */
    public errorCode: Code = new Code();

    /**
     * If the error is XHR based, is the HTTP status returned by the call.
     */
    public httpStatus: string = "";

    /**
     * If the error is XHR based, is the HTTP status text received.
     */
     public httpStatusText: string = "";

    /**
     * Indicate if the error was caused by some connectivity issue or an interaction with the Propel API.
     */
    public isHTTPError: boolean = false;

    /**
      * Original error.
      */
    public error: Error | null = null;

    /**
     * Error timestamp
     */
    public timestamp: Date = new Date();

    /**
     * Error location where was captured.
     */
    public location: string = "";

    /**
     * Source URL, (if applies).
     */
    public url: string = "";

    /**
     * Indicates if the source of the errors is related to Websocket protocol:
     */
    public isWSError: boolean = false;

    /**
     * Message provided to the user.
     */
    public userMessage: string = "";

    /**
     * List of inner exceptions.
     */
    public innerExceptions: any[] = [];

    /**
     * Error message
     */
    public message: string = "";

    /**
     * Name
     */
    public name: string = "";

    /**
     * Error stack
     */
    // public stack: string = "";

    private _paramError: any;

    /**
     * Constructor
     * @param {Error | string} error Can be an error message or a native Error instance.
     * @param {Code} errorCode Is a Code error instance.
     */
    constructor(error: PropelError | Error | string, errorCode?: Code, httpStatus?: string) {

        if (!error) {
            throw new Error(`The PropelError class constructor cannot receive null value in the "error" parameter. 
            Value provided was of type "${typeof error}", with value "${error}" `)
        } else if (!(typeof error == "object" || typeof error == "string")) {
            throw new Error(`PropelError class constructor must receive an Error object or an error message in the "error" argument. 
            Value provided was of type "${typeof error}", with value "${error}" `)
        }

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

        this._paramError = Object.assign({}, error);

        //Special case for the "HTTPResponseError" in Angular that embeds the Propel error within:
        if ((error as any).error?.errors?.length > 0) {
            error = (error as any).error.errors[0];
        }

        this.parseError(error);
        this.parseInnerExceptions(error);
        this.parseName(error);
        this.parseMessage(error);
        this.parseStack(error);
        this.parseErrorCode(error, errorCode);
        this.parseHTTPStatus(error, httpStatus);
        this.parseLocation();
        this.parseUrl(error);
        this.parseIsWSError(error);
    }

    /**
     * Parses the supplied error and add it to the error property.
     * @param err Error orerror message.
     */
    parseError(err: PropelError | Error | string): void {
        if (this.error) return;

        if (typeof err == "object") {
            this.error = Object.assign({}, ((err as any).error ? (err as any).error : err));
        }
        else {
            this.error = new Error(String(err));
        }
    }

    /**
     * Parse the name attribute of the error.
     * @param {Error | string} err Error message or original Error instance.
     */
    parseName(err: PropelError | Error | string): void {
        let name: string = "";

        if((err as Error)?.name && (err as Error).name.startsWith(PROPEL_ERROR_NAME)){
            name = (err as Error)?.name;
        }
        else {
            name = ((err as Error).name) ? (err as Error).name : "";
            name = `${PROPEL_ERROR_NAME}${(name) ? " - " : ""}${name}`;
        }

        this.name = name; 
    }

    /**
     * Parse the message attribute of the error.
     * @param {Error | string} err Error message or original Error instance.
     */
    parseMessage(err: PropelError | Error | string): void {
        let message: string = ((err as Error).message) ? (err as Error).message : String(err);
        this.message = message;
    }

    /**
     * Parse the stack and return it as a plain text.
     * If the err param is just an error message, we will get the actual stack as the property value.
     * @param {Error | string} err Error message or original Error instance.
     */
    parseStack(err: PropelError | Error | string): void {
        let stack: string = "";

        if (this.stackArray.length > 0) return;

        if ((err as any).stackArray) {
            this.stackArray = (err as any).stackArray;
            return;
        }

        if (typeof err == 'object' && (err as Error).stack) {
            stack = String((err as Error).stack);
        }
        else {
            stack = String((new Error()).stack);
        }

        if (stack) {
            this.stackArray = stack
                .split('\n')
                .filter((line) => {
                    //Excluding first line and references to this module from the stack:
                    return !(line.startsWith("Error") || line.indexOf(PROPEL_ERROR_NAME) != -1)
                })
                .map((line) => line.trim());
        }
    }

    /**
     * Parse the standard API error code if any.
     * @param {Error | string} err Error message or original Error instance.
     */
    parseErrorCode(err: PropelError | Error | string, errorCode?: Code): void {
        if (this.errorCode.key) return;

        this.errorCode = (errorCode) ? errorCode : this.errorCode;

        if ((err as PropelError).errorCode) {
            this.errorCode = (err as PropelError).errorCode
        }

        this.userMessage = this.errorCode.userMessage;
    }

    /**
     * Parse the HTTP status.
     * @param {string | undefined} httpStatus Error message or original Error instance.
     */
    parseHTTPStatus(err: PropelError | Error | string, httpStatus?: string | undefined): void {
        if (this.httpStatus) return;

        this.httpStatus = (httpStatus === null || httpStatus === undefined || httpStatus == "") ? "" : parseInt(httpStatus).toString();

        if (!this.httpStatus && (err as any).srcElement?.readyState) {
            this.httpStatus = String((err as any).srcElement.readyState);
        }  
        
        if (!this.httpStatus && this._paramError.status) {
            this.httpStatus = this._paramError.status
            this.httpStatusText = this._paramError.statusText
            this.isHTTPError = true;
        }

        this.isHTTPError = Boolean(this.httpStatus);
    }

    /**
     * Capture any original errors recursively and add it to the innerExceptions collection.
     * @param e Error or error message.
     */
    parseInnerExceptions(e: any): void {
        if (e.innerExceptions && Array.isArray(e.innerExceptions)) {
            this.innerExceptions = e.innerExceptions;
        }
        else {
            this.internalParseInnerExceptions(e);
        }
    }
    
    private internalParseInnerExceptions(e: any): void {
        if (e.error) {
            this.innerExceptions.push(e.error);
            this.parseInnerExceptions(e.error);
        }
    }

    /**
     * Parsing the location URL if present.
     * @param {Error | string} err Error message or original Error instance.
     */
    parseLocation(): void {
        if (this.location) return;

        try {
            this.location = (location && location.href) ? location.href : "";
        } catch (error) {
            
        }
    }

    /**
     * If there is an URL in the error, we must capture it here.
     * @param {Error | string} err Error message or original Error instance.
     */
    parseUrl(err: PropelError | Error | string): void {
        if (this.url) return;

        this.url = ((err as any).srcElement?.url) ? String((err as any).srcElement.url) : "";

        if (!this.url && this._paramError.url) {
            this.url = this._paramError.url;
        }
    }

    /**
     * Parse of the flag indicating if is a Websockets error
     * @param {Error | string} err Error message or original Error instance.
     */
    parseIsWSError(err: PropelError | Error | string): void {
        this.isWSError = Boolean((err as any).srcElement && (err as any).srcElement instanceof WebSocket);
    }

    toString(): string {
        return `${this.name}: ${this.message}`
    }
}
