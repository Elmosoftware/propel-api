import { APIError } from "../core/api-error";

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
        stringValue = (stringValue == null || stringValue == undefined)? "" : stringValue;
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
     * Converts the supplied Mongo DB type to his GraphQL equivalent.
     * @param type Mongo DB type to convert to the GraphQL equivalent.
     */
    static mongoToGraphQLTypeConverter(type: string): string {

        let ret = "";
        type = String(type);

        switch (type) {
            case "String":
                ret = "String";
                break;
            case "Number":
                ret = "Int";
                break;
            case "Date":
                ret = "String";
                break;
            case "Buffer":
                ret = "[Int]!"
                break;
            case "Boolean":
                ret = "Boolean";
                break;
            case "Mixed":
                ret = "String";
                break;
            case "ObjectID":
                ret = "ID";
                break;
            case "Decimal128":
                ret = "Float";
                break;
            default:
                throw new APIError(`The specified type is not supported by this API. Therefore can't be converted to a GraphQL\n
                Type specified: "${type}".`)
        }

        return ret;
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
            case "System.Collections.Hashtable":
                ret = "Object";
                break;
            case "System.Management.Automation.SwitchParameter":
                ret = "Boolean";
                break;
            default:
                throw new APIError(`The specified PowerShell type is not supported by this API. Therefore can't be converted to a Javascript type.\n
                Type specified: "${type}".`)
        }

        return ret;
    }
}
