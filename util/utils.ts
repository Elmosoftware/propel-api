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
}
