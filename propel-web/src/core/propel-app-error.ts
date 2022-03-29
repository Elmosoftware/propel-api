import { PropelError } from "../../../propel-shared/core/propel-error";
import { Code } from "../../../propel-shared/core/error-codes";

export class PropelAppError extends PropelError {
    /**
      * Constructor
      * @param {Error | string} error Can be an error message or a native Error instance.
      * @param {Code} errorCode Is a Code error instance.
      */
    constructor(error: Error | PropelError | string, errorCode?: Code) {
        super(error, errorCode);

        let userMessage: string = "";
        this.timestamp = new Date();
        this.location = location.href;

        //Filling Inner exceptions recursively:
        this._FillInnerExceptions(error)

        if (typeof error == "object") {
            if (error.name && error.name == "HttpErrorResponse") {
                //if is an HTTP error response, is better to patch any http status provided 
                //by a PropelError with this one:
                this.httpStatus = ((error as any).status) ? (error as any).status.toString() : "";
                this.httpStatusText = ((error as any).statusText) ? (error as any).statusText.toString() : "";
                this.url = ((error as any).url) ? (error as any).url.toString() : "";
                this.isHTTPError = true;

                //The HTTPErrorResponse object store the error sent in the body of the response in the 
                //"error" property In our case this must be an APIResponse object with all the error details.
                if ((error as any).error && (error as any).error && (error as any).error.errors) {
                    (error as any).error.errors.forEach((e) => {
                         if (e.errorCode) {
                            userMessage = (e.errorCode as Code).userMessage;
                        }
                    });
                }
            }
            else if ((error as any).srcElement && (error as any).srcElement instanceof WebSocket) {
                this.url = ((error as any).srcElement.url) ? String((error as any).srcElement.url) : "";
                this.httpStatus = ((error as any).srcElement.readyState) ? String((error as any).srcElement.readyState) : "";
                this.isWSError = true;
                if (error instanceof CloseEvent) {
                    this.httpStatusText = `Websocket connection closed unexpectedly. Code:${error.code}.`;
                }
            }          
        }

        this.userMessage = userMessage;
    }

    /**
       * Original error.
       */
    public readonly error: Error;

    /**
     * Error timestamp
     */
    public readonly timestamp: Date;

    /**
     * Error location where was captured.
     */
    public readonly location: string;

    /**
     * Source URL, (if applies).
     */
    public readonly url: string = "";

    /**
     * If the error is XHR based, is the HTTP status text received.
     */
    public readonly httpStatusText: string = "";

    /**
     * Message provided to the user.
     */
    public readonly userMessage: string;

    /**
     * List of inner exceptions.
     */
    public readonly innerExceptions: any[] = [];

    /**
     * Indicates if the source of the errors is related to HTTP protocol:
     */
    public readonly isHTTPError: boolean = false;

    /**
     * Indicates if the source of the errors is related to Websocket protocol:
     */
    public readonly isWSError: boolean = false;

    private _FillInnerExceptions(e) {
        if (e.error) {
            this.innerExceptions.push(e.error);
            this._FillInnerExceptions(e.error);
        }
    }
}