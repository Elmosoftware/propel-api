const APIError = require("../core/api-error")

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
    format(e){

        let errorCode = (e.originalError && e.originalError.errorCode) ? e.originalError.errorCode : null;
        let stackArray = (e.originalError && e.originalError.stackArray) ? e.originalError.stackArray : [];

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

module.exports = new ErrorFormatter()