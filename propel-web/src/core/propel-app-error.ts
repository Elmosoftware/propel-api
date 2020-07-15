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

        this.timestamp = new Date()

        if (typeof error != "string") {
            this.error = error;
        }

        this.location = location.href;

        //Filling Inner exceptions recursively:
        this._FillInnerExceptions(error)

        //We need now to check for user error codes. If the code is in the error:
        if ((error as PropelError).errorCode) {
            userMessage = (error as PropelError).errorCode.userMessage;
        }
        else {
            //We must check on the inner exceptions for user error codes:
            this.innerExceptions.forEach(inner => {
                if ((inner as PropelError).errorCode) {
                    userMessage = (inner as PropelError).errorCode.userMessage;
                    return;
                }
            })
        }

        if (typeof error == "object") {
            
            if(error.name && error.name == "HttpErrorResponse") {
                this.httpStatus = ((error as any).status) ? (error as any).status.toString() : "";
                this.httpStatusText = ((error as any).statusText) ? (error as any).statusText.toString() : "";
                this.url = ((error as any).url) ? (error as any).url.toString() : "";
            }
            else if ((error as any).srcElement && (error as any).srcElement instanceof WebSocket) {
                this.url = ((error as any).srcElement.url) ? String((error as any).srcElement.url) : "";
                this.httpStatus = ((error as any).srcElement.readyState) ? String((error as any).srcElement.readyState) : "";
                if (error instanceof CloseEvent) {
                    this.httpStatusText = `Websocket connection closed unexpectedly. Code:${error.code}.`;
                }
            }

            //If the error is related to some request that went wrong, we note this to the user:
            if (!userMessage) {
                userMessage = "There was a connectivity error, please retry the operation in a few minutes."
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
     * If the error is XHR based, is the HTTP status returned by the call.
     */
    public readonly httpStatus: string = "";

    /**
     * If the error is XHR based, is the HTTP status text received.
     */
    public readonly httpStatusText: string = "";

    /**
     * Message provided to the user.
     */
    public readonly userMessage: string;

    /**
     * Indicates if the error is related to some possible user action.
     */
    public readonly isUserError: boolean;

    /**
     * List of inner exceptions.
     */
    public readonly innerExceptions: any[] = [];

    private _FillInnerExceptions(e) {
        if (e.error) {
            this.innerExceptions.push(e.error);
            this._FillInnerExceptions(e.error);
        }
    }
}