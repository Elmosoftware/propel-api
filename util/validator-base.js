// @ts-check

var Codes = require("../core/api-error-codes")
var APIError = require("../core/api-error")

/**
 * Provides basic methods to apply basic validation rules.
 * Provide an internal repository of validation error messages and also an attribute indicating 
 * if the validation was successful or not.
 */
class ValidatorBase {

    constructor() {
        this.reset();
    }

    //#region Private Members
    /**
     * Add and error to the list of error messages found by the validator.
     * @param {string} errorMsg Error message to add.
     */
    _addError(errorMsg) {
        this._results.push("-" + errorMsg)
    }

    get isValid() {
        return (this._results.length == 0);
    }

    getErrors(reset = false) {
        var ret = null;

        if (!this.isValid) {
            ret = new APIError(this._results.join("\n"))
        }

        if (reset) {
            this.reset();
        }
        
        return ret;
    }

    reset() {
        this._results = [];
    }
}

module.exports = ValidatorBase;