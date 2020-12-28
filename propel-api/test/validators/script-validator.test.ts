import { ScriptValidator } from "../../validators/script-validator";
import { ScriptParameter } from "../../../propel-shared/models/script-parameter";
import { ParameterValue } from "../../../propel-shared/models/parameter-value";

let param: ScriptParameter;
let paramValue: ParameterValue | undefined;

function setAllValid() {
    param = new ScriptParameter();

    param.name = "TestParameter";
    param.hasDefault = false;
    param.defaultValue = "";
    param.required = true;
    param.canBeNull = false;
    param.canBeEmpty = false;

    paramValue = new ParameterValue();
    paramValue.name = param.name;
    paramValue.value = "TestValue";
}

describe("ScriptValidator Class", () => {

    let val: ScriptValidator;

    beforeAll(() => {
        val = new ScriptValidator();
    })

    beforeEach(() => {
        setAllValid();
        val.reset();
    })

    test(`Valid Configuration`, () => {

        val.validateParameter(param, paramValue)

        expect(val.isValid).toBe(true);
    }),
    test(`Invalid when param is required, has no default value and no value was provided either.`, () => {
        
        param.hasDefault = false;
        param.defaultValue = "";
        param.required = true;
        paramValue = undefined
        
        val.validateParameter(param, paramValue);

        expect(val.isValid).toBe(false);
        //@ts-ignore
        expect(val.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(val.getErrors().message).toContain("There is no supplied or default value for a parameter marked as required");
    })
    test(`Invalid when param can't be null and the provided value is actually null.`, () => {
        
        param.hasDefault = false;
        param.defaultValue = "";
        param.canBeNull = false;
        //@ts-ignore
        paramValue.value = "$null"
        
        val.validateParameter(param, paramValue);

        expect(val.isValid).toBe(false);
        //@ts-ignore
        expect(val.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(val.getErrors().message).toContain("A null value was supplied or set by default to a paramter that has a validation that prevent null values.");
    })
    test(`Invalid when param can't be null and there is no provided value and the default value is actually null.`, () => {
        
        param.hasDefault = true;
        param.defaultValue = "$null";
        param.canBeNull = false;
        paramValue = undefined;
        
        val.validateParameter(param, paramValue);

        expect(val.isValid).toBe(false);
        //@ts-ignore
        expect(val.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(val.getErrors().message).toContain("A null value was supplied or set by default to a paramter that has a validation that prevent null values.");
    })
    test(`Invalid when param can't be empty and the supplied value is an empty string.`, () => {
        
        param.hasDefault = false;
        param.defaultValue = "";
        param.canBeEmpty = false;
        //@ts-ignore
        paramValue.value = "";
        
        val.validateParameter(param, paramValue);

        expect(val.isValid).toBe(false);
        //@ts-ignore
        expect(val.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(val.getErrors().message).toContain("A null or empty value was supplied or set by default to a parameter that has a validation that prevent null or empty values");
    })
    test(`Invalid when param can't be empty and the supplied value is an empty array.`, () => {
        
        param.hasDefault = false;
        param.defaultValue = "";
        param.canBeEmpty = false;
        //@ts-ignore
        paramValue.value = "@()";
        
        val.validateParameter(param, paramValue);

        expect(val.isValid).toBe(false);
        //@ts-ignore
        expect(val.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(val.getErrors().message).toContain("A null or empty value was supplied or set by default to a parameter that has a validation that prevent null or empty values");
    })
    test(`Invalid when param can't be empty there is no supplied value and the default value is an empty string.`, () => {
        
        param.hasDefault = true;
        param.defaultValue = `""`;
        param.canBeEmpty = false;
        //@ts-ignore
        paramValue = undefined;
        
        val.validateParameter(param, paramValue);

        expect(val.isValid).toBe(false);
        //@ts-ignore
        expect(val.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(val.getErrors().message).toContain("A null or empty value was supplied or set by default to a parameter that has a validation that prevent null or empty values");
    })
    test(`Invalid when param can't be empty there is no supplied value and the default value is an empty array.`, () => {
        
        param.hasDefault = true;
        param.defaultValue = "@()";
        param.canBeEmpty = false;
        //@ts-ignore
        paramValue = undefined;
        
        val.validateParameter(param, paramValue);

        expect(val.isValid).toBe(false);
        //@ts-ignore
        expect(val.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(val.getErrors().message).toContain("A null or empty value was supplied or set by default to a parameter that has a validation that prevent null or empty values");
    })
    test(`Valid when evaluating native types with default value and parameter value is not defined.`, () => {
        
        param.hasDefault = true;
        param.defaultValue = "@()";
        param.canBeEmpty = true;
        param.nativeType = "Array"
        //@ts-ignore
        paramValue = undefined
        
        val.validateParameter(param, paramValue);

        expect(val.isValid).toBe(true);
    })
    test(`Invalid when parameter native type doesn't match the parameter value native type.`, () => {
        
        param.hasDefault = true;
        param.defaultValue = "@()";
        param.canBeEmpty = false;
        param.nativeType = "Array"
        //@ts-ignore
        paramValue = new ParameterValue();
        paramValue.nativeType = "Boolean"
        paramValue.value = "true"
        
        val.validateParameter(param, paramValue);

        expect(val.isValid).toBe(false);
        //@ts-ignore
        expect(val.getErrors().message).not.toBeFalsy();
        //@ts-ignore
        expect(val.getErrors().message).toContain("The supplied parameter type is different from the stored value");
    })
})
