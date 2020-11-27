import { ValidatorBase } from "../../propel-shared/validators/validator-base";
import { ScriptParameter } from "../../propel-shared/models/script-parameter";
import { ParameterValue } from "../../propel-shared/models/parameter-value";
import { POWERSHELL_NULL_LITERAL, Utils } from "../../propel-shared/utils/utils";

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
        let value: string = POWERSHELL_NULL_LITERAL;

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
        else if (!param.canBeNull && value === POWERSHELL_NULL_LITERAL) {
            ret = `A null value was supplied or set by default to a paramter that has a validation that prevent null values. Parameter name: "$${param.name}", Parameter can take nulls: "${param.canBeNull}", Supplied value: "${value}".`
        } 
        //If the param can't be empty and we are specifying null or and empty string or array:
        else if (!param.canBeEmpty && (value === `` || value === `""` || value === `''` || value === `@()`)) {
            ret = `A null or empty value was supplied or set by default to a parameter that has a validation that prevent null or empty values. Parameter name: "$${param.name}", Parameter can take nulls: "${param.canBeNull}", Parameter can take empty values: "${param.canBeEmpty}", Supplied value: "${value}".`
        }
        else if(paramValue && paramValue.nativeType && param.nativeType !== paramValue.nativeType) {
            ret = `The supplied parameter type is different from the stored value type. Parameter name: "$${param.name}", Parameter type: "${param.nativeType}", Stored Parameter Value type: "${paramValue?.nativeType}".`
        }

        if (ret) {
            super._addError(ret);
        }

        return this;
    }
}
