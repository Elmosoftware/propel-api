/**
 * GraphQL Error formatter.
 */
class ErrorFormatter {

    constructor() {
    }

    /**
     * Format the error exactly as it has to be seen in the response.
     * @param {GraphQLError} e GRaphQL Instance error.
     */
    format(e: any): any{

        let errorCode: any = null;
        let stackArray: string[] = [];
        let stack: string = "";

        if (e.originalError) {
            errorCode = (e.originalError.errorCode) ? e.originalError.errorCode : null;
            stackArray = (e.originalError.stackArray) ? e.originalError.stackArray : [];
            stack = (e.originalError.stack) ? e.originalError.stack : "";
        }
        else {
            errorCode = (e.errorCode) ? e.errorCode : null;
            stackArray = (e.stackArray) ? e.stackArray : [];
            stack = (e.stack) ? e.stack : "";
        }

        if (stackArray.length == 0 && stack) {
            stackArray.push(stack);
        }

        return {
            name: e.name,
            message: e.message,
            stack: stackArray,
            errorCode: errorCode,
            locations: e.locations,
            path: e.path
        }
    }
}

export let errorFormatter = new ErrorFormatter()
