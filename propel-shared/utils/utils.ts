import { ParameterValue } from "../models/parameter-value";

/**
 * Utilities.
 */
export class Utils {

    /**
     * Returns a boolean value indicating if the supplied value is an object reference.
     * @param {object} object Object instance to validate.
     */
    static isObject(object: any): boolean {
        let ret = false

        if (object && typeof object == "object" &&
            object.constructor && typeof object.constructor == "function") {
            ret = true;
        }

        return ret;
    }

    /**
     * Returns a boolean value that indicates if the object has no properties.
     * e.g: 
     *  isEmptyObject(new Object()) -> true.
     *  isEmptyObject("Hello!") -> false.
     *  isEmptyObject(123) -> false.
     *  isEmptyObject({ attribute: "Hello!" }) -> false.
     *  isEmptyObject([]) -> true, (an "Array" object!).
     * @param {object} object Object reference tobe tested.
     */
    static isEmptyObject(object: any): boolean {
        let ret = false

        if (this.isObject(object) && Object.keys(object).length == 0) {
            ret = true
        }

        return ret;
    }

    /**
     * Return a default value is the firstparameter is an empty object.
     * @param {object} object Object reference.
     * @param {any} defaultValue Value to return in the case the object reference is an empty object
     */
    static defaultIfEmptyObject(object: any, defaultValue: any = null): any {

        if (this.isEmptyObject(object)) {
            return defaultValue
        }

        return object;
    }

    /**
     * This function returns the same string but capitalized.
     * @param {any} stringValue String value to be capitalized.
     */
    static capitalize(stringValue: any): string {
        stringValue = (stringValue == null || stringValue == undefined) ? "" : stringValue;
        return String(stringValue).charAt(0).toUpperCase() + String(stringValue).slice(1);
    }

    /**
     * Returns a boolean value indicating if the specified string is a serialized JSON object.
     * @param JSONString JSON string to validate.
     */
    static isValidJSON(JSONString: string): boolean {
        let ret: boolean = true;

        try {
            JSON.parse(JSONString);
        } catch (error) {
            ret = false;
        }

        return ret;
    }

    /**
     * This method try to detect JSON as part of a multiline text. If a valid JSON is detected
     * it will be returned, otherwise this method will return an empty string.
     * As a valid JSON we are going to consider only an object or object array. Consider the below examples
     *      `This is a
     *      multiline with JSON object in next line
     *      { "myData": "This is my data" }
     *      And another line at the end`
     * For that case this function will return: `{"myData":"This is my data" }`
     * @param text Text to check.
     */
    static detectJSON(text: string): string {

        let ret = "";

        if (!text || typeof text !== "string") return text;

        let arr = text.split("\n") //Splitting by lines.
            .map((t) => t.replace(/[\r\t\f]/gi, "")); //Removing escape chars.

        for (let i = arr.length - 1; i >= 0; i--) {
            //If seems to be a JSON:
            if ((arr[i].startsWith("{") && arr[i].endsWith("}")) ||
                (arr[i].startsWith("[{") && arr[i].endsWith("}]"))) {
                //We try it:
                if (this.isValidJSON(arr[i])) {
                    ret = arr[i];
                    break;
                }
            }
        }

        return ret;
    }

    /**
     * This is an "async" version of the "Array.prototype.forEach" method that handles async functions 
     * as callbacks. Normal forEach function will call the callback and immediately iterate to the 
     * next item. This version is going to wait for the asynchronous callback to finish before to 
     * continue with the next item in the array.
     * @author [Sébastien Chopin](https://gist.github.com/Atinux/fd2bcce63e44a7d3addddc166ce93fb2) 
     * @param array Array to iterate
     * @param callback Callback function to call for each item in the array.
     */
    static async asyncForEach<T>(array: T[], callback: Function) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

    /**
     * Converts the supplied PowerShell type to his Javascript equivalent.
     * @param type Powershell type full name to convert to the Javascript equivalent.
     */
    static powershellToJavascriptTypeConverter(type: string): string {

        let ret = "";
        type = String(type);

        switch (type) {
            case "System.Object":
                ret = "Object";
                break;
            case "System.String":
                ret = "String";
                break;
            case "System.Char":
                ret = "String";
                break;
            case "System.Byte":
                ret = "Number";
                break;
            case "System.Int32":
                ret = "Number";
                break;
            case "System.Int64":
                ret = "Number";
                break;
            case "System.Boolean":
                ret = "Boolean";
                break;
            case "System.Decimal":
                ret = "Number";
                break;
            case "System.Single":
                ret = "Number";
                break;
            case "System.Double":
                ret = "Number";
                break;
            case "System.DateTime":
                ret = "Date";
                break;
            case "System.Xml.XmlDocument":
                ret = "Object";
                break;
            case "System.Object[]":
                ret = "Array";
                break;
            case "System.String[]":
                ret = "Array";
                break;
            case "System.Int32[]":
                ret = "Array";
                break;
            case "System.Array":
                ret = "Array";
                break;
            case "System.Collections.Hashtable":
                ret = "Object";
                break;
            case "System.Management.Automation.SwitchParameter":
                ret = "Boolean";
                break;
            default:
                throw new Error(`The specified PowerShell type is not supported by this API. Therefore can't be converted to a Javascript type.\n
                Type specified: "${type}".`)
        }

        return ret;
    }

    /**
     * This method convert the parameter value supplied, from a native Javascript value to a 
     * one can be understood by PowerShell during the script execution.
     * @param pv Parameter value to convert.
     */
    static JavascriptToPowerShellValueConverter(pv: ParameterValue): void {

        if (!pv || !pv.nativeType) {
            return;
        }

        //If is a boolean type, we need to change the native boolean literals of Javascript by 
        //the ones used in powershell:
        if (pv.nativeType == "Boolean") {
            if (typeof pv.value == "boolean") {
                pv.value = (pv.value) ? "$true" : "$false";
            }
            else {
                pv.value = (pv.value == "true") ? "$true" : "$false";
            }            
        }
        //Double quoted strings in PowerShell works differently, so we need to convert any:
        else if(pv.nativeType == "String") {
            pv.value = pv.value.replace(/"/gi, "`\"")
        }
        //If the native type is not a string and the value is an empty string, we must replace 
        //it by the null PowerShell literal:
        else if (pv.nativeType != "String" && pv.value == "") {
            pv.value = "$null"
        }
    }

    /**
     * This method convert the parameter value supplied, from a native PowerShell value to the 
     * corresponding native Javascript value.
     * @param pv Parameter value to convert.
     */
    static PowerShellToJavascriptValueConverter(pv: ParameterValue): void {

        if (!pv || !pv.nativeType) {
            return;
        }

        //If is a boolean type, we need to change the native PowerShell literals for boolean to
        // a Javascript boolean value:
        if (pv.nativeType == "Boolean") {
            if (typeof pv.value !== "boolean") {
                //@ts-ignore
                pv.value = Boolean(pv.value == "$true");
            }            
        }
        //Double quoted strings in PowerShell works differently, so we need to convert any:
        else if(pv.nativeType == "String") {
            pv.value = pv.value.replace(/`"/gi, "\"")
        }
        //If the native type is not a string and the value is a null PowerShell literal, we 
        //must replace it by an empty string:
        else if (pv.nativeType != "String" && pv.value == "$null") {
            pv.value = ""
        }
    }

    /**
     * Return a string composed to as many tabs as specified.
     * @param numberOfTabs Number of tabs.
     * @param tabSize Tab spaces to use.
     */
    static tabs(numberOfTabs: number, tabSize: number = 2): string {
        let ret: string = "";

        if (!isNaN(numberOfTabs) && numberOfTabs > 0) {
            ret = ` `.repeat(numberOfTabs * tabSize);
        }

        return ret;
    }

    /**
     * ANSI escape codes are used in console apps to display colors. This function remove those codes in order 
     * to get a clean and readeble text string.
     * @param s String that contins the ANSI escape codes to be removed.
     */
    static removeANSIEscapeCodes(s: string): string {
        let removeAnsiPattern = [
            '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
            '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
        ].join('|');
        let reg = new RegExp(removeAnsiPattern, "g");

        return s.replace(reg, "");
    }

    /**
     * Returns a boolean value that indicates if the provided string is quoted.
     * e.g: 
     * "\"My cat is white\"" --> will return true.
     * "'My cat is white'" --> will return true.
     * "My cat is white" --> will return false.
     * "\"My cat is white" --> will return false.
     * "My cat is white\""" --> will return false.
     * @param s String to verify.
     */
    static isQuotedString(s: string): boolean {
        let ret: boolean;

        ret = Boolean(s) && (
            (s.startsWith(`"`) && s.endsWith(`"`)) ||
            (s.startsWith(`'`) && s.endsWith(`'`))
        )

        return ret;
    }

    /**
     * If the specified string is not quoted, it will add quotes.
     * @param s String to quote.
     */
    static addQuotes(s: string): string {
        let ret: string = s;

        if (s && !this.isQuotedString(s)) {
            ret = `"${s}"`;
        }

        return ret;
    }

    /**
     * If the supplied string is quoted, those quotes will be removed.
     * @param s String which quotes will be removed.
     */
    static removeQuotes(s: string): string {
        let ret: string = s;

        if (s && this.isQuotedString(s)) {
            ret = s.slice(1, s.length - 1)
        }

        return ret;
    }
}
