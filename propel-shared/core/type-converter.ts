import { PropelError } from "./propel-error";
import { JSType, PowerShellLiterals, PSType } from "./type-definitions";
import { JavascriptArrayConverter, JavascriptBooleanConverter, 
    JavascriptDateConverter, JavascriptStringConverter, JavascriptAnyConverter, 
    PowerShellArrayConverter, PowerShellBooleanConverter, PowerShellDateConverter, 
    PowerShellStringConverter, PowerShellAnyConverter, JavascriptNumberConverter, PowerShellNumberConverter} from "./converters";
import { ValueConverterInterface } from "./value-converter-interface";

/**
 * Abstract representation of a type including a set of converters.
 */
export type ConvertibleType<T> = {
    /**
     * Reference type
     */
    type: T,
    /**
     * List of value converters to the different platform/languages:
     */
    converters: {
        javascript: ValueConverterInterface<any>
        powershell: ValueConverterInterface<any>
    },
    /**
     * This is the empty/null representation of the type in PowerShell.
     */
    emptyOrNull: string,
    /**
     * Boolean value that indicates if the type can accept empty or null values.
     * This is to cover some specific cases,(like PowerShell Datetimes), that can't accept null
     * ,($null), values in the argument list of a script invocation.
     */
    typeAcceptEmptyOrNull: boolean
}

/**
 * Type information to convert all the Javascript types involved in script execution.
 */
type ConvertibleJavascriptType = {
    [type in JSType]: ConvertibleType<JSType>
}

/**
 * Type information related to all the PowerShell types supported. 
 */
type ConvertiblePowerShellType = {
    [type in PSType]: ConvertibleType<JSType>
} 

const ConvertibleJavascript: ConvertibleJavascriptType = {
    [JSType.Object]: {
        type: JSType.Object,
        converters: {
            javascript: new JavascriptAnyConverter(),
            powershell: new PowerShellAnyConverter()
        },
        emptyOrNull: PowerShellLiterals.$null,
        typeAcceptEmptyOrNull: true
    },
    [JSType.String]: {
        type: JSType.String,
        converters: {
            javascript: new JavascriptStringConverter(),
            powershell: new PowerShellStringConverter()
        },
        emptyOrNull: PowerShellLiterals.EmptyString,
        typeAcceptEmptyOrNull: true
    },
    [JSType.Number]: {
        type: JSType.Number,
        converters: {
            javascript: new JavascriptNumberConverter(),
            powershell: new PowerShellNumberConverter()
        },
        emptyOrNull: PowerShellLiterals.$null,
        typeAcceptEmptyOrNull: true
    },
    [JSType.Boolean]: {
        type: JSType.Boolean,
        converters: {
            javascript: new JavascriptBooleanConverter(),
            powershell: new PowerShellBooleanConverter()
        },
        emptyOrNull: PowerShellLiterals.EmptyString,
        typeAcceptEmptyOrNull: true
    },
    [JSType.Date]: {
        type: JSType.Date,
        converters: {
            javascript: new JavascriptDateConverter(),
            powershell: new PowerShellDateConverter()
        }, 
        emptyOrNull: PowerShellLiterals.EmptyString,
        typeAcceptEmptyOrNull: false
    },
    [JSType.Array]: {
        type: JSType.Array,
        converters: {
            javascript: new JavascriptArrayConverter(),
            powershell: new PowerShellArrayConverter()
        },
        emptyOrNull: PowerShellLiterals.EmptyArray,
        typeAcceptEmptyOrNull: true
    }
}

const ConvertiblePowerShell: ConvertiblePowerShellType  = {
    [PSType.String]: ConvertibleJavascript.String,
    [PSType.Char]: ConvertibleJavascript.String,
    [PSType.Byte]: ConvertibleJavascript.Number,
    [PSType.Int32]: ConvertibleJavascript.Number,
    [PSType.Int64]: ConvertibleJavascript.Number,
    [PSType.Single]: ConvertibleJavascript.Number,
    [PSType.Decimal]: ConvertibleJavascript.Number,
    [PSType.Double]: ConvertibleJavascript.Number,
    [PSType.DateTime]: ConvertibleJavascript.Date,
    [PSType.StringArray]: ConvertibleJavascript.Array,
    [PSType.Int32Array]: ConvertibleJavascript.Array,
    [PSType.Array]: ConvertibleJavascript.Array,
    [PSType.Boolean]: ConvertibleJavascript.Boolean,
    [PSType.Switch]: ConvertibleJavascript.Boolean,
    [PSType.Object]: ConvertibleJavascript.Object,
    [PSType.XML]: ConvertibleJavascript.Object,
    [PSType.Hashtable]: ConvertibleJavascript.Object,
    [PSType.PSCustomObject]: ConvertibleJavascript.Object,
    [PSType.PSObject]: ConvertibleJavascript.Object
}

/**
 * Provides methods to 
 */
export class TypeConverter {

    constructor() {
    }

    /**
     * Converts the supplied Powershelltype into the most appropiate to 
     * use in a Javascript representation.
     * @param type PowerShell type to convert
     * @returns The most suitable Javascript type.
     * @throws If the specified PowerShellType is not supported.
     */
    static fromPowerShellType(type: PSType | string): JSType {
        let ret: JSType = ConvertiblePowerShell[type as PSType]?.type;

        if (!ret) {
            throw new PropelError(`The specified PowerShell type is not supported by this API. ` +
            `Therefore can't be converted to a Javascript type. PowerShell type supplied: "${String(type)}".`)
        }

        return ret;
    }

    /**
     * Returns a convertible JSType that includes all the information to convert 
     * from PowerShell to Javascript and vice versa.
     * @param type JSType or a string representing the Javascript type lik "String" or "Object".
     * @returns A ConvertibleType for that particular JS type including literals and converters.
     */
    static getConvertibleJSType(type: JSType | string): ConvertibleType<JSType> {
        let ret =  ConvertibleJavascript[type as JSType]

        if (!ret) {
            throw new PropelError(`The specified Javascript type doesn't exists. ` +
            `Javascript type supplied: "${String(type)}".`)
        }

        return ret;
    } 
}
