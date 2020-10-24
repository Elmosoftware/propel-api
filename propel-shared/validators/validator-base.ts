// @ts-check
import { PropelError } from "../core/propel-error";

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
    
    /**
     * Returns a boolean value indicating if the validator passes successfully all validations.
     */
    get isValid(): boolean {
        return (this._results.length == 0);
    }

    /**
     * Returns a single error object encapsulating all teh validation error messages.
     */
    getErrors(): PropelError | null  {
        var ret = null;

        if (!this.isValid) {
            ret = new PropelError(this._results.join("\r\n"))
        }
        
        return ret;
    }

    /**
     * Reset the validator by cleaning all the error messages.
     */
    reset(): void {
        this._results = [];
    }

    protected _addError(errorMsg: string) {
        this._results.push("- " + errorMsg)
    }
}
