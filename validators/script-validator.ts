import { ValidatorBase } from "./validator-base";
import { ScriptParameter } from "../models/script-parameter";
import { ParameterValue } from "../models/parameter-value";

/**
 * This call provides methods to validate Scripts, his parameters, values, etc.
 * @extends ValidatorBase
 */
export class ScriptValidator extends ValidatorBase {

    constructor() {
        super();
    }

    /**
     * Validate the supplied "QueryModifier" object instance.
     * @param {object} queryModifier "QueryModifier" object.
     */
    validateParameter(param: ScriptParameter, paramValue?: ParameterValue): ScriptValidator {
        let ret = "";
        let value: string = "$null";

        if (paramValue !== undefined) {
            value = paramValue.value;
        }
        else if (param.hasDefault) {
            value = param.defaultValue;
        }

        //If the param is required and has no default value and there is no supplied 
        //value either, there is an indication that possibly the script changed 
        //and now the workflow need to be remediated: 
        if (paramValue == undefined && param.required && !param.hasDefault) {
            ret = `There is no supplied or default value for a parameter marked as required. Parameter name: "$${param.name}".`
        }
        //If the param can't be null and we are specifying that exact value:
        else if (!param.canBeNull && value === "$null") {
            ret = `A null value was supplied or set by default to a paramter that has a validation that prevent null values. Parameter name: "$${param.name}", Parameter can take nulls: "${param.canBeNull}", Supplied value: "${value}".`
        } 
        //If the param can't be empty and we are specifying null or and empty string or array:
        else if (!param.canBeEmpty && (value === `` || value === `""` || value === `''` || value === `@()`)) {
            ret = `A null or empty value was supplied or set by default to a parameter that has a validation that prevent null or empty values. Parameter name: "$${param.name}", Parameter can take nulls: "${param.canBeNull}", Parameter can take empty values: "${param.canBeEmpty}", Supplied value: "${value}".`
        }

        if (ret) {
            super._addError(ret);
        }

        return this;
    }
}
