import { ValidatorBase } from "./validator-base";

/**
 * Query validator provides a validation set for the @class "QueryModifier".
 * @extends ValidatorBase
 */
export class QueryValidator extends ValidatorBase {

    constructor() {
        super();
    }

    /**
     * Validate the supplied "QueryModifier" object instance.
     * @param {object} queryModifier "QueryModifier" object.
     */
    validateQuery(queryModifier: any): QueryValidator {

        let ret = "";

        if (!queryModifier) {
            ret = `The parameter "queryModifier" can't be null or empty.
            Supplied parameter value is "${queryModifier}".`;
        }
        else if (!(queryModifier === Object(queryModifier))) {
            ret = `We expected an Object for parameter "queryModifier".
            Supplied parameter type is "${typeof queryModifier}".`;
        }
        else {
            this._validatePagination(queryModifier.skip, queryModifier.top);
            this._validatePopulate(queryModifier.populate);
            this._validateSorting(queryModifier.sortBy);
            this._validateFiltering(queryModifier.filterBy);
        }

        if (ret) {
            super._addError(ret);
        }

        return this;
    }

    _validatePagination(skip: any, top: any) {
        let ret = "";

        if (!((typeof skip === "string") || (typeof skip === "number"))) {
            ret = `We expected a String or Number for the pagination parameter "skip".
                Supplied parameter type is "${typeof skip}".`;
        }
        else if (!((typeof top === "string") || (typeof top === "number"))) {
            ret = `We expected a String or Number for the pagination parameter "top".
            Supplied parameter type is "${typeof top}".`;
        }
        else if (Number.isNaN(Number(skip))) {
            ret = `The pagination parameter "skip" is not a number.
            Supplied parameter value is "${skip}".`;
        }
        else if (Number.isNaN(Number(top))) {
            ret = `The pagination parameter "top" is not a number.
            Supplied parameter value is "${top}".`;
        }
        else if (skip != "" && Number(skip) < 0) {
            ret = `The pagination parameter "skip" can't be negative.
            Supplied parameter value is "${skip}".`;
        }
        else if (top != "" && Number(top) < 0) {
            ret = `The pagination parameter "top" can't be negative.
            Supplied parameter value is "${top}".`;
        }

        if (ret) {
            super._addError(ret);
        }

        return this;
    }

    _validatePopulate(populate: any) {
        let ret = "";

        if (!(typeof populate === "boolean")) {
            ret = `We expected a Boolean for the "populate" query modifier.
            Supplied parameter type is "${typeof populate}".`;
        }

        if (ret) {
            super._addError(ret);
        }

        return this;
    }

    _validateSorting(value: any) {
        let ret = "";

        if (!(typeof value === "string")) {
            ret = `We expected a String for the "sortBy" query modifier.
            Supplied parameter type is "${typeof value}".`;
        }

        if (ret) {
            super._addError(ret);
        }

        return this;
    }

    _validateFiltering(value: any) {
        let ret = "";

        if (!(typeof value === "string")) {
            ret = `We expected a String for the "filterBy" query modifier.
            Supplied parameter type is "${typeof value}".`;
        } else if (value == "") {
            ret = `We expected a not null or empty String for the "filterBy" query modifier.
            Supplied parameter value is "${value}".`;
        } else if (!(value.trim().startsWith("{") && value.trim().endsWith("}"))) {
            ret = `We expected a valid JSON string value for the "filterBy" query modifier.
            Supplied parameter value is "${value}".`;
        } else {
            try {
                let obj = JSON.parse(value);
            } catch (error) {
                ret = `We expected a valid JSON string value for the "filterBy" query modifier.
            Supplied parameter value is "${value}".
            We got the following error when trying to parse it as json: 
            ${(error && error.message) ? error.message : String(error)}`;
            }
        }

        if (ret) {
            super._addError(ret);
        }

        return this;
    }
}
