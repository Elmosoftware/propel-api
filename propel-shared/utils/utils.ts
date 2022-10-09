import { Credential } from "../models/credential";
import { ParameterValue } from "../models/parameter-value";
import { CredentialTypes } from "../models/credential-types";
import { Secret } from "../models/secret";
import { SecretValue } from "../models/secret-value";
import { PropelError } from "../core/propel-error";
import { WindowsSecret } from "../models/windows-secret";
import { AWSSecret } from "../models/aws-secret";
import { GenericAPIKeySecret } from "../models/generic-apikey-secret";
import { SharedSystemHelper } from "./shared-system-helper";

export const POWERSHELL_NULL_LITERAL = "$null"
export const MILLISECONDS_DAY: number = 1000 * 60 * 60 * 24;
const INPUT_DATE_FORMAT: string = "YYYY-MM-DDTHH:mm"

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
     * Add a backtick before any double quote in the supplied string. This helps on Powershell 
     * strings parsing when the string delimiter is a double quote.
     * @example
     * BacktickDoubleQuotesForPowershell('Hello my name is Tom!') -> 'Hello my name is Tom!'
     * BacktickDoubleQuotesForPowershell('Hello my name " is Tom!') -> 'Hello my name `" is Tom!'
     * //If is already backticked, nothing changes:
     * BacktickDoubleQuotesForPowershell('Hello my name `" is Tom!') -> 'Hello my name `" is Tom!'
     * @param value Text to convert.
     * @returns A new string with any double quotes backticked.
     */
    static backtickDoubleQuotes(value: string): string {

        if (!value || typeof value != "string") {
            return value;
        }

        return this.removeBacktickDoubleQuotes(value)
            .replace(/"/gi, "`\"")
    }

    /**
     * Remove any backticked double quotes.
     * @example
     * removeBacktickDoubleQuotes('Hello my name is `" Tom!') -> 'Hello my name is " Tom!'
     * removeBacktickDoubleQuotes('Hello my name " is Tom!') -> 'Hello my name " is Tom!'
     * @param value Text to convert.
     * @returns A new string without any double quotes backticked.
     */
    static removeBacktickDoubleQuotes(value: string): string {

        if (!value || typeof value != "string") {
            return value;
        }

        return value.replace(/`"/gi, "\"")
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
     * Escape any regular expresssion character in the supplied text.
     * Based on the suggestion to escape Regular expression chars as indicated in MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
     * @param text text to escape.
     */
    static escapeRegEx(text: string) {
        return text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
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

    /**
     * This method facilitates to creates duplicate names for items enabling to create copys of items 
     * of for example one entity that require unique names.
     * So, if you have an entity with unique names and and you want to get the duplicate for the 
     * name "Sample Name", this method will return "Sample Name (Duplicate)". Also, you can provide in the 
     * parameter "currentNames" a list of actual names for the master name currently existing.
     * This method is going to search in the list and provide the next one.
     * For example: for the master name "My Item" and if you provide the folloing list of current names:
     * ["Mi Item", "My Item (Duplicate)"]. This method will return the value "My Item (Duplicate 2)". 
     * @param masterIdentifier Name of the item we want to duplicate.
     * @param currentIdentifierList List of itemsthat starts with the Master name.
     */
    static getNextDuplicateName(masterIdentifier: string, currentIdentifierList: string[]): string {

        let dupRegExp = new RegExp("\\(Duplicate[ 0-9]*\\)$");
        let dupNumber: number = 0;
        let ret: string = ""

        if (!masterIdentifier) return ret;

        currentIdentifierList.filter((identifier: string) => identifier !== masterIdentifier)
            .forEach((identifier) => {

                let matchDup = identifier.match(dupRegExp);

                if (matchDup) {
                    //We need to figure out if there is a first duplicate, like "My Workflow (Duplicate)" or
                    //a subsequent duplicate like "My Workflow (Duplicate 2)":
                    let dupKey = matchDup[0].match(new RegExp("[0-9]+"))

                    //If is the first duplicate like in "My Workflow (Duplicate)":
                    if (!dupKey) {
                        dupNumber = Math.max(dupNumber, 1); //Always keep highest number for the duplicate key.
                    }
                    else { //If there is a subsequent duplicate like in "My Workflow (Duplicate 2)":"
                        dupNumber = Math.max(dupNumber, Number(dupKey[0]));
                    }
                }
            })

        ret = masterIdentifier.trim() + ((dupNumber == 0) ? " (Duplicate)" : ` (Duplicate ${dupNumber + 1})`)

        return ret;
    }

    /**
     * For a Typescript enumeration, this method return if the specified key exists.
     * e.g.: If you have the following enum type:
     * @example 
     * enum MyEnum {
     *     First = "1st",
     *     Second = "2nd",
     *     Third = "3rd"
     * }
     * 
     * testEnumKey(MyEnum, "First") -> true
     * testEnumKey(MyEnum, "fiRST", false) -> true
     * testEnumKey(MyEnum, "Fourth") -> false
     * 
     * @param enumType The enumeration type.
     * @param key The key we are going to search for.
     * @param caseSensitive Boolean value that represent case sesitivity of the search. By default the search will be case sensitive.
     * @returns A boolean value indicating if the key is valid. 
     */
    static testEnumKey(enumType: any, key: string, caseSensitive: boolean = true): boolean {

        let ret: boolean = false;

        if (!enumType) return ret;
        if (typeof key !== "string") return ret;

        if (caseSensitive) {
            ret = !(enumType[String(key)] == undefined);
        }
        else {
            ret = Object.keys(enumType)
                .map((value) => {
                    return String(value).toLowerCase()
                })
                .includes(String(key).toLowerCase());
        }

        return ret
    }

    /**
     * Returns the index in the Typescript enumeration type for the specific supplied key.
     * @example 
     * enum MyStringEnum {
     *     First = "1st",
     *     Second = "2nd",
     *     Third = "3rd"
     * }
     * enum MyNumericEnum {
     *     One = 1,
     *     Two = 2,
     *     Three = 3
     * }
     * 
     * getEnumIndex(MyStringEnum, "First") -> 0
     * getEnumIndex(MyStringEnum, "fiRST", false) -> 0
     * getEnumIndex(MyStringEnum, "Fourth") -> -1
     * 
     * getEnumIndex(MyNumericEnum, "One") -> 0
     * getEnumIndex(MyStringEnum, "one", false) -> 0
     * getEnumIndex(MyStringEnum, "Four") -> -1
     * 
     * @param enumType The enumeration type.
     * @param key The key we are going to search for.
     * @param caseSensitive Boolean value that represent case sesitivity of the search. By default the search will be case sensitive.
     * @returns A boolean value indicating if the key is valid. 
     */
    static getEnumIndex(enumType: any, key: string, caseSensitive: boolean = true): number {

        let ret: number = -1;
        let keys: string[];

        if (!enumType) return ret;
        if (typeof key !== "string") return ret;

        ret = Object.keys(enumType)
            .map((value) => {
                return (caseSensitive) ? value : String(value).toLowerCase();
            })
            .findIndex((value) => { return (value == ((caseSensitive) ? key : String(key).toLowerCase())) });

        return ret
    }

    /**
     * Returns the value of the Typescript enumeration type for the specific supplied key.
     * @example 
     * enum MyStringEnum {
     *     First = "1st",
     *     Second = "2nd",
     *     Third = "3rd"
     * }
     * enum MyNumericEnum {
     *     One = 1,
     *     Two = 2,
     *     Three = 3
     * }
     * 
     * getEnumValue(MyStringEnum, "First") -> "1st"
     * getEnumValue(MyStringEnum, "fiRST", false) -> "1st"
     * getEnumValue(MyStringEnum, "Fourth") -> undefined
     * 
     * getEnumValue(MyNumericEnum, "One") -> 1
     * getEnumValue(MyStringEnum, "one", false) -> 1
     * getEnumValue(MyStringEnum, "Four") -> undefined
     * 
     * @param enumType The enumeration type.
     * @param key The key we are going to search for.
     * @param caseSensitive Boolean value that represent case sesitivity of the search. By default the search will be case sensitive.
     * @returns A boolean value indicating if the key is valid. 
     */
    static getEnumValue(enumType: any, key: string, caseSensitive: boolean = true): string | number | undefined {

        let ret: string | undefined = undefined;
        let keys: string[];
        let index: number = -1;

        if (!enumType) return ret;
        if (typeof key !== "string") return ret;

        index = this.getEnumIndex(enumType, key, caseSensitive)

        if (index > -1) {
            ret = enumType[Object.keys(enumType)[index]];
        }

        return ret
    }

    /**
     * Returns an array of key value pairs that represent all the entries of the enumeration.
     * @param enumType The enumeration type.
     * @returns An array of key value pairs.
     */
    static getEnum(enumType: any): { key: string; value: string | number; }[] {
        let ret: { key: string; value: string | number; }[] = []

        if (!enumType) return ret;

        Object.entries(enumType)
            .map((entry) => {
                /**
                 * Note: in the case of enumerations that are holding numeric values, those values 
                 * will be listed in the entries too, so we need to exclude them:
                 */
                if (Number.isNaN(parseInt(entry[0]))) {
                    ret.push({
                        key: String(entry[0]),
                        value: ((typeof entry[1] == "number") ? Number(entry[1]) : String(entry[1]))
                    });
                }
            })

        return ret;
    }

    /**
     * Returns the code to create a PSCredential object with the user and paswword in the Secret specified.
     * @param secret Secret that must be of type "WindowsSecret".
     * @returns A string containing the PowerShell code to create a PSCredential object with the Secret data.
     */
    static getPSCredentialFromSecret(secret: Secret<SecretValue>): string {
        let user: string;
        let secretValue: WindowsSecret;

        if (!secret || !secret.value) throw new PropelError(`The supplied secret is a null reference. Supplied value is: "${JSON.stringify(String(secret))}".`);

        secretValue = (secret.value as WindowsSecret);

        if (!secretValue.userName) throw new PropelError(`The supplied secret value doesn't have a "userName" property. Supplied object is: ${JSON.stringify(String(secret))}.`);

        user = this.getFullyQualifiedUserName(secretValue.userName, secretValue?.domain);
        return `New-Object System.Management.Automation.PSCredential "${this.backtickDoubleQuotes(user)}", (ConvertTo-SecureString "${this.backtickDoubleQuotes(secretValue?.password)}" -AsPlainText -Force)`;
    }

    /**
     * By getting the user and domain this method return a string containing the fully qualified user name.
     * e.g: 
     * @example
     *  getFullyQualifiedUserName("john.doe") --> "john.doe"
     *  getFullyQualifiedUserName("john.doe", "MyDomain") --> "MyDomain\\john.doe"
     * @param user User name
     * @param domain Optional domain ame
     * @returns a fully qualified user name.
     */
    static getFullyQualifiedUserName(user: string, domain: string = ""): string {
        let ret: string = ""

        if (!user) return ret;

        if (domain) {
            ret += `${domain}\\`
        }

        ret += user;

        return ret;
    }

    /**
     * Returns a serialized version of a PowerShell custom object containing the information of 
     * the supplied credential and secret.
     * @param credential Credential object 
     * @param secret Secret object holding the secret part of the credential.
     * @returns A string containing the code to create a PowerShell custom object with the credential information.
     */
    static credentialToPowerShellCustomObject(credential: Credential, secret: Secret<SecretValue>): string {
        let ret: string = "";

        if (!credential) throw new PropelError(`We expect a valid Credential. the parameter "credential" is a null reference.`);
        if (!credential.credentialType) throw new PropelError(`The supplied credential instance doesn't have a valid CredentialType assigned."credentialType" attribute value: "${String(credential.credentialType)}".`);
        if (!secret || !secret.value) throw new PropelError(`The supplied secret is a null reference. Supplied value is: "${JSON.stringify(String(secret))}".`);

        //Building the credential part of the object:
        ret = `[pscustomobject]@{
${this.tabs(1)}Name = "${credential.name}";
${this.tabs(1)}Type = "${credential.credentialType}";
${this.tabs(1)}Fields = [pscustomobject]@{
${this.tabs(2)}${credential.fields
                .map((item, i) => { return `${(i > 0) ? this.tabs(2) : ""}${item.name} = "${this.backtickDoubleQuotes(String(item.value))}";` })
                .join(`\r\n`)}\r\n${this.tabs(2)}};\r\n`

        //Building the secret part:    
        switch (credential.credentialType) {
            case CredentialTypes.Windows:
                ret += `${this.tabs(1)}cred = (${this.getPSCredentialFromSecret(secret)});`
                break;
            case CredentialTypes.AWS:
                let AWSSecretValue: AWSSecret = (secret.value as AWSSecret)
                ret += `${this.tabs(1)}AccessKey = "${this.backtickDoubleQuotes(AWSSecretValue?.accessKey)}";
${this.tabs(1)}SecretKey = "${this.backtickDoubleQuotes(AWSSecretValue?.secretKey)}";`
                break;
            case CredentialTypes.APIKey:
                let APIKeySecretValue: GenericAPIKeySecret = (secret.value as GenericAPIKeySecret)
                ret += `${this.tabs(1)}AppId = "${this.backtickDoubleQuotes(APIKeySecretValue?.appId)}";
${this.tabs(1)}APIKey = "${this.backtickDoubleQuotes(APIKeySecretValue?.apiKey)}";`
                break;
            default:
                throw new PropelError(`The specified credential type is not defined. Credential type: "${credential.credentialType}"`);
        }

        ret += `\r\n};`

        return ret;
    }

    /**
     * Remove the time portion from the suppied Date object.
     * If no date is specified, it returns the current date.
     * @example
     * removeTimeFromDate(new Date(2021, 9, 17, 8, 24, 0)) -->  2021-09-17 00:00:00.000
     * @param d Date from which we would like to remove the time portion. 
     * @returns A new Date instance that has only date portion, (hours, minutes, seconds and ms 
     * are been set to the value "0").
     */
    static removeTimeFromDate(date: Date = new Date()): Date {

        let ret: Date = date;

        if (date && date instanceof Date) {
            ret = new Date(date.setHours(0, 0, 0, 0));
        }

        return ret;
    }

    /**
     * Add or subtract days to the specified Date instance. If you wouldlike to add days, you must 
     * pass a positive value. To subtract days a negative one.
     * @example
     * addDays(newDate(2021, 9, 17, 3, 28, 0), 1) -> new Date(2021, 9, 18, 3, 28, 0);
     * addDays(newDate(2021, 9, 17, 3, 28, 0), -1) -> new Date(2021, 9, 16, 3, 28, 0);
     * @param date Date to add or substract days.
     * @param days Amount of days to add, (positive number) or subtract, (negative number).
     * @returns The resultant date.
     */
    static addDays(date: Date, days: number): Date {
        let ret: Date = date;

        if (date && date instanceof Date && !isNaN(parseInt(String(days)))) {
            ret = new Date(Number(date) + (days * MILLISECONDS_DAY));
        }

        return ret;
    }

    /**
     * For a defined number it will return the suffix that correspond to his ordinal.
     * @example
     * getOrdinalSuffix(1) -> "st"
     * @param n Number which ordinal we would like to found.
     * @returns A string containing the ordinal suffix for the specified number
     */
    static getOrdinalSuffix(n: number): string {
        //Thanks to: https://gist.github.com/jlbruno/1535691/db35b4f3af3dcbb42babc01541410f291a8e8fac

        if (isNaN(parseInt(String(n)))) return ""

        let s = ["th", "st", "nd", "rd"]
        let v = n % 100;

        return s[(v - 20) % 10] || s[v] || s[0];
    }

    /**
    * Returns a random integer between the specified interval.
    * @param {number} min Minimum random integer to include in the results.
    * @param {number} max Maximum random integer to include in the results.
    * @author Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    */
    static getRandomIntFromInterval(min: number, max: number) {

        if (min == undefined || min == null || max == undefined || max == null) {
            throw new PropelError(`You need to supply both paramters "min" and "max". 
Supplied values are: "min":${JSON.stringify(min)}", "max":${JSON.stringify(max)}".`);
        }

        if (isNaN(parseInt(String(min))) || isNaN(parseInt(String(max)))) {
            throw new PropelError(`"min" and "max" parameters need to be numbers. 
Supplied values are: "min":${JSON.stringify(min)}", "max":${JSON.stringify(max)}".`);
        }

        if (Math.max(min, max) != max) {
            throw new PropelError(`Parameter "min" need to be less than "max". 
Supplied values are: "min":${JSON.stringify(min)}", "max":${JSON.stringify(max)}".`);
        }

        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Return the path portion of a URL with a defined slash format. The path will include 
     * always a leading forwardslash and never a trailing forwardslash.  
     * @example
     * getURLPath("http://mysite.com/segment1/segment2?key1=value1") -> "/segment1/segment2"
     * getURLPath("http://mysite.com/segment1/segment2/?key1=value1") -> "/segment1/segment2"
     * getURLPath("segment1/segment2?key1=value1") -> "/segment1/segment2"
     * getURLPath("segment1/segment2") -> "/segment1/segment2"
     * getURLPath("/segment1/segment2/") -> "/segment1/segment2"
     * @param url URL to get the path portion.
     * @returns The Path portion of a URL.
     */
    static getURLPath(url: string): string {
        if (!url) return "";
        return this.joinURLPath(new URL(url.toLowerCase(), "http://.").pathname); //Including a dummy base URL 
        //in the case the supplied URL not include one, to avoid the constructor throwing a ERR_INVALID_URL error.
    }

    /**
     * Join and normalize all the url paths.
     * This is inspird by the suggestion of [Wojciech Fiderek](https://github.com/fider) in the 
     * Node.JS [Feature request: url.join(baseUrl, ...others) #18288](https://github.com/nodejs/node/issues/18288)
     * @example
     * joinURLPath("mypath") => "/mypath"
     * joinURLPath("mypath/other") => "/mypath/other"
     * joinURLPath("mypath", "is", "long") => "/mypath/is/long"
     * joinURLPath("/mypa//th", "/is//", "/lon///g/") => "/mypa/th/is/lon/g"
     * @param paths URL paths
     * @returns The url paths joined with leading forward slash but non trailing slashes.
     * @
     */
    static joinURLPath(...paths: string[]): string {

        let ret: string = paths
            .filter((path: string, i: number) => path !== "" || i == 0) //Allowing empty strings 
            //only at the beginning of the array. Ulterior join is going to prevent duplicated forwardslashes.
            .map((path: string) => {

                if (!path) return "";

                if (path.indexOf("/") !== -1) {
                    return this.joinURLPath(...path.split("/"))
                        .substring(1); //removing the extra "/" at the beginning because 
                    //will be included again in the return.
                }
                else {
                    return path.replace(/\//g, "") //Removing all forwardslashes.
                }
            })
            .join("/")

        return (!ret.startsWith("/") ? "/" : "") + ret;
    }
}
