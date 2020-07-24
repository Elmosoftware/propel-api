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
     * Remove empty lines from the supplied text. Optionally can remove only empty new lines at the end 
     * of the text.
     * @param text text to inspect.
     * @param removeOnlyLastEmptyLines Boolean value indicating if only the last empty line need to be removed.
     * By default this value is "true".
     */
    static removeEmptyLines(text: string, removeOnlyLastEmptyLines: boolean = true): string {
        let cr = "\n"
        let ret: string[]

        if (!text) {
            return text
        }

        ret = text.split(cr);

        if (removeOnlyLastEmptyLines) {
            while (ret.length > 1 && ret[ret.length - 1] == "") {
                ret.splice(ret.length - 1, 1);
            }
        }
        else {
            ret = ret.filter((line) => line.length > 0);
        }

        return ret.join(cr);
    }

    /**
     * This is an "async" version of the "Array.prototype.forEach" method that handles async functions 
     * as callbacks. Normal forEach function will call the callback and immediately iterate to the 
     * next item. This version is going to wait for the assynchronous callback to finish before to 
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
}
