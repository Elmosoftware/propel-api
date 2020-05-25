// @ts-check
import { PropelError } from "../../propel-shared/core/propel-error";

/**
 * Provides basic methods to apply basic validation rules.
 * Provide an internal repository of validation error messages and also an attribute indicating 
 * if the validation was successful or not.
 */
export class ValidatorBase {

    private _results: string[] = [];

    constructor() {
        this.reset();
    }
    
    get isValid(): boolean {
        return (this._results.length == 0);
    }

    getErrors(): PropelError | null  {
        var ret = null;

        if (!this.isValid) {
            ret = new PropelError(this._results.join("\n"))
        }
        
        return ret;
    }

    reset() {
        this._results = [];
    }

    //#region Private Members
    /**
     * Add and error to the list of error messages found by the validator.
     * @param {string} errorMsg Error message to add.
     */
    _addError(errorMsg: string) {
        this._results.push("- " + errorMsg)
    }
}
