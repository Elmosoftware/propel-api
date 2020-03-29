const { Code } = require("./api-error-codes");

/**
 * Represents an error originated in the API. Extends native @class Error class. 
 * @extends Error
 */
class APIError extends Error {

    /**
     * Constructor
     * @param {Error | string} error Can be an error message or a native Error instance.
     * @param {Code} errorCode Is a Code error instance.
     */
    constructor(error, errorCode = null){
        
        if (!error) {
            throw new Error(`The APIError class constructor cannot receive null value in the "error" parameter. 
            Value provided was of type "${typeof error}", with value "${error}" `)
        } else if (!(typeof error ==  "object" || typeof error ==  "string")) {
            throw new Error(`APIError class constructor must receive an Error object or an error message in the "error" argument. 
            Value provided was of type "${typeof error}", with value "${error}" `)
        } 
        
        if (errorCode && typeof errorCode !=  "object") {
            throw new Error(`APIError class constructor optional paramater "errorCode" requires a "Code" object. 
            Value provided was of type "${typeof errorCode}", with value "${errorCode}" `)
        }

        super((error.message)? error.message : String(error));
        this.name = this.parseName(error);
        this.message = this.parseMessage(error);
        this.stackArray = this.parseStack(error);
        this.errorCode = this.parseErrorCode(errorCode); 
    }

    /**
     * Parse the name attribute of the error.
     * @param {Error | string} err Error message or original Error instance.
     */
    parseName(err) {
        return `APIError${(err.name) ? " - " + err.name : ""}`; 
    }

    /**
     * Parse the message attribute of the error.
     * @param {Error | string} err Error message or original Error instance.
     */
    parseMessage(err) {
        let ret = String(err);

        if (err.message) {
            ret = err.message
        }

        return ret
    }

    /**
     * Parse the stack and turn it into a string[].
     * If the err param is just an error message, we will get the actual stack as the property value.
     * @param {Error | string} err Error message or original Error instance.
     */
    parseStack(err) {
        let ret = []

        if (process.env.NODE_ENV != "production") {
            if (typeof err == 'object') {
                ret = (err.stack) ? err.stack.split('\n') : ret;
            }
            else {
                ret = Error().stack
                    .split('\n')
                    .filter((line) => {
                        //Excluding first line and references to this module from the stack:
                        return !(line.startsWith("Error") || line.indexOf("api-error.js") != -1)
                    })
                    .map( (line) => line.trim());
            }
        }

        return ret;
    }

    /**
     * Parse the standard API error code if any.
     * @param {Error | string} err Error message or original Error instance.
     */
    parseErrorCode(errorCode){
        return (errorCode) ? errorCode : new Code(); 
    }
}

module.exports = APIError