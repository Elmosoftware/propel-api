import { Utils } from "../utils/utils";
import { SharedSystemHelper } from "../utils/shared-system-helper";
import { PowerShellLiterals } from "./type-definitions";
import { ValueConverterInterface } from "./value-converter-interface";

const UI_INPUT_DATETIME_FORMAT: string = "yyyy-MM-dd'T'HH:mm"
export const PS_ARRAY_PREFIX = "@("
export const PS_ARRAY_SUFFIX = ")"

/**
 * A null formatter. It will do no transformation on the received value.
 */
export class JavascriptAnyConverter implements ValueConverterInterface<any> {

    constructor() {
    }

    convert(value: any): any {
        return value;
    }
}

/**
 * This will proceed to a basic formatting of any value to a PowerShell literal or 
 * converting it to a string.
 */
export class PowerShellAnyConverter implements ValueConverterInterface<string> {

    constructor() {
    }

    convert(value: any): any {
        if (value == null || value == undefined || 
            value == PowerShellLiterals.$null) return PowerShellLiterals.$null;
        else return String(value);
    }
}

/**
 * Conversion to Javascript Boolean.
 */
export class JavascriptBooleanConverter implements ValueConverterInterface<boolean> {
    
    constructor() {
    }

    convert(value: any): boolean {
        let ret: boolean = Boolean(value);

        if (typeof value !== "boolean") {
            ret = Boolean(value == PowerShellLiterals.$true);
        }

        return ret;
    }
}

/**
 * Converts the supplied value to a PowerShell boolean representation.
 */
export class PowerShellBooleanConverter implements ValueConverterInterface<string> {
    
    constructor() {
    }

    convert(value: any): string {
        let ret: string = ""

        if (typeof value == "boolean") {
            ret = (value) ? PowerShellLiterals.$true : PowerShellLiterals.$false;
        }
        else {
            ret = (String(value).toLowerCase() == "true") ? PowerShellLiterals.$true : PowerShellLiterals.$false;
        }

        return ret;
    }
}

/**
 * Conversion to a Javascript string.
 */
export class JavascriptStringConverter implements ValueConverterInterface<string> {
    
    constructor() {
    }

    convert(value: any): string {
        return Utils.removeBacktickDoubleQuotes(String(value))
    }
}

/**
 * Converts the supplied value to a PowerShell string.
 */
export class PowerShellStringConverter implements ValueConverterInterface<string> {
    
    constructor() {
    }

    convert(value: any): string {
        return Utils.backtickDoubleQuotes(String(value))
    }
}

/**
 * Conversion to a Javascript array value.
 */
export class JavascriptArrayConverter implements ValueConverterInterface<Array<any>> {
    
    constructor() {
    }

    convert(value: any): Array<any> {

        if (value == null || value == undefined || value == "" 
            || value == PowerShellLiterals.$null || value == PowerShellLiterals.EmptyArray) {
            value = []
        }
        else {
            value = String(value)

            if (value.startsWith(PS_ARRAY_PREFIX)) {
                value = value.substring(PS_ARRAY_PREFIX.length);

                if (value.endsWith(PS_ARRAY_SUFFIX)) {
                    value = value.substring(0, value.length - PS_ARRAY_SUFFIX.length);
                }
            }

            if (value.trim() == "") {
                value = []
            }
            else {
                value = value
                    .trim()
                    .split(",")
                    .map((val: string) => {
                        if (isNaN(parseInt(String(val)))) return Utils.removeQuotes(val.trim())
                        return Number(val)
                    })
            }
        }

        return value;
    }
}

/**
 * Converts the provided value to a serialized PowerShell array.
 * @example
 * (new PowerShellArrayConverter()).convert(["Hello", "World"]) ===> `@("Hello","World")`
 */
export class PowerShellArrayConverter implements ValueConverterInterface<string> {
    
    constructor() {
    }

    convert(value: any): string {
        let ret: any[] = []

        if (!Array.isArray(value)) {
            ret = [value]
        }
        else {
            ret = value
        }

        if (ret.length == 0) return PowerShellLiterals.EmptyArray ;

        return PS_ARRAY_PREFIX +
            ret
                .map((val) => {
                    //If is not a numeric value, we need to quote each item of the array:
                    if (isNaN(parseInt(String(val)))) {
                        val = Utils.backtickDoubleQuotes(val)
                        if (!Utils.isQuotedString(val)) {
                            val = Utils.addQuotes(val);
                        }
                    }
                    return val;
                })
                .join(",")
            + PS_ARRAY_SUFFIX
    }
}

/**
 * Convert the supplied date to a string date representation to be used by the UI.
 * If the date is invalid it will return an empty string.
 */
export class JavascriptDateConverter implements ValueConverterInterface<string> {
    
    constructor() {
    }

    convert(value: any): string {
        return SharedSystemHelper.formatDate(String(value), UI_INPUT_DATETIME_FORMAT)
    }
}

/**
 * Converts the supplied date to a standard ISO-8601 format to be used.
 * If the date is invalid it will return an empty string.
 */
export class PowerShellDateConverter implements ValueConverterInterface<string> {
    
    constructor() {
    }

    convert(value: any): string {
        return SharedSystemHelper.toISOFormat(String(value))
    }
}
