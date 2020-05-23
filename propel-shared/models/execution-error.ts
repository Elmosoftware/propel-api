// @ts-check

/**
 * Represents the errors returned during a script invocation.
 */
export class ExecutionError {

    /**
     * Error Timestamp.
     */
    public throwAt: Date = new Date();
    
    /**
     * Error message.
     */
    public message: string = "";

    /**
     * Stack trace.
     */
    public stack: string[] = [];

    constructor(error?: Error | string) {
        if (error && error instanceof Error) {
            this.message = error.message;
            this.stack = [(error.stack) ? error.stack : ""];
        }
        else {
            this.message = String(error);
        }
    }
}