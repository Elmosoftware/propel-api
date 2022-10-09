import { JSType } from "./type-definitions";
import { ConvertibleType, TypeConverter } from "./type-converter";
import { ParameterValue } from "../models/parameter-value";
import { PropelError } from "./propel-error";

/**
 * Conversion of values
 */
export class ParameterValueConverter {

    /**
     * Converts the value of the provided ParameterValue instance to a Javascript representation.
     * @param pv ParameterValue to convert.
     */
    static toJavascript(pv: ParameterValue): void {
        let type: ConvertibleType<JSType> = this.getType(pv);
        pv.value = type.converters.javascript.convert(pv.value);
    }

    /**
     * Converts the value of the provided ParameterValue instance to a serialized PowerShell 
     * representation to be sent as a parameter value during a script execution.
     * @param pv ParameterValue to convert.
     */
    static toPowerShell(pv: ParameterValue): void {
        let type: ConvertibleType<JSType> = this.getType(pv);
        pv.value = type.converters.powershell.convert(pv.value);
    }

    private static getType(pv: ParameterValue): ConvertibleType<JSType> {
        if (!pv || !pv.nativeType) { 
            throw new PropelError(`A ParameterValue instance was expected but a null reference or a ` +
            `not ParameterValue instance was received. Value received: "${JSON.stringify(pv)}"`)
        }        
        return TypeConverter.getConvertibleJSType(pv.nativeType)
    }
}