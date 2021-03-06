/**
 * Error formatter.
 */
class ErrorFormatter {

    constructor() {
    }

    /**
     * Format the error exactly as it has to be seen in the API Response errors collection.
     * @param {any} e Error Instance.
     */
    format(e: any): any{

        let errorCode: any = null;
        let stackArray: string[] = [];
        let stack: string = "";

        errorCode = (e.errorCode) ? e.errorCode : null;
        stackArray = (e.stackArray) ? e.stackArray : [];
        stack = (e.stack) ? e.stack : "";
        
        if (stackArray.length == 0 && stack) {
            stackArray.push(stack);
        }

        return {
            name: e.name,
            message: e.message,
            stack: stack,
            stackArray: stackArray,
            errorCode: errorCode
        }
    }
}

export let errorFormatter = new ErrorFormatter()
