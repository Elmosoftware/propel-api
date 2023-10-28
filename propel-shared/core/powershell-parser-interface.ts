import { ParameterValue } from "../models/parameter-value"
import { PSType } from "./type-definitions"

export interface PowerShellParser {
    /**
     * Readonly property containing the code results from parsing values.
     */
    code: string

    /**
     * Set of parameters values as result of parsing a code string. 
     */
    values: ParameterValue[]

    /**
     * Powershell type, usually a Hashtable or PSCustomObject.
     */
    type: PSType

    /**
     * Parse the specified code. As result of this process the "values" attribute is 
     * going to contain the list of parsed key/values.
     * @param code Code
     */
    fromString(code: string): void;

    /**
     * Parse the specified values. As result of this process the attribute "code" will contain the 
     * serialized object version.
     * @param values Values to convert to code
     * @param type Optional type
     */
	fromValues(values: ParameterValue[], type?: PSType): void;
}