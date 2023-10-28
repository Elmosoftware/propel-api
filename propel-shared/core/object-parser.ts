import { ParameterValue } from "../models/parameter-value";
import { Utils } from "../utils/utils";
import { PowerShellParser } from "./powershell-parser-interface";
import { PropelError } from "./propel-error";
import { PSType } from "./type-definitions";

/**
 * Special characters in the parsing process.
 */
const char = {
    carriageReturn: `\r`,
    newLine: `\n`,
    semicolon: `;`,
    at: `@`,
    lCurlyBracket: `{`,
    rCurlyBracket: `}`,
    lParenthesis: `(`,
    rParenthesis: `)`,
    lSquareBracket: `[`,
    rSquareBracket: `]`,
    doubleQuote: `"`,
    singleQuote: `'`,
    equal: `=`,
    space: ` `
}

export class ObjectParser implements PowerShellParser {

    private _code: string = ""
    private _type: PSType = PSType.Hashtable
    private _allowedTypeDescriptors = [
        "pscustomobject",
        "hashtable",
        "object"
    ]
    private _punct: Map<string, string>
    private _punctQueue: string[] = []
    private _rxPunctuators: RegExp
    private _values: ParameterValue[] = []

    get code(): string {
        return this._code
    }

    get type(): PSType {
        return this._type
    }

    get values(): ParameterValue[] {
        return this._values
    }

    constructor() {
        let rxText = ``
        this._punct = new Map<string, string>()
        
        //Hashtables/PSCustomObjects @{   }:
        this._punct.set(char.at + char.lCurlyBracket, char.rCurlyBracket)
        //Here strings @" "@ or @' '@:
        this._punct.set(char.at + char.doubleQuote, char.doubleQuote + char.at)
        this._punct.set(char.at + char.singleQuote, char.singleQuote + char.at)
        //Strings " "  ' '
        this._punct.set(char.doubleQuote, char.doubleQuote)
        this._punct.set(char.singleQuote, char.singleQuote)
        //Arrays @(   ):
        this._punct.set(char.at + char.lParenthesis, char.rParenthesis)
        //Type constraints [   ]:
        this._punct.set(char.lSquareBracket, char.rSquareBracket)
        //Code blocks  {   }:
        this._punct.set(char.lCurlyBracket, char.rCurlyBracket)
        //Grouping Parenthesis (  ):
        this._punct.set(char.lParenthesis, char.rParenthesis)

        //Creating a regular expression to detect all of this characters:
        this._punct.forEach((value, key) => {
            let a = [key, value]

            //Escaping for regex:
            a.forEach((item, i) => {
                a[i] = a[i].replace(char.lParenthesis, `\\` + char.lParenthesis)
                    .replace(char.rParenthesis, `\\` + char.rParenthesis)
                    .replace(char.lSquareBracket, `\\` + char.lSquareBracket)
                    .replace(char.rSquareBracket, `\\` + char.rSquareBracket)
            })

            if (!rxText) {
                rxText = `(`
            }
            else {
                rxText += `|`
            }

            rxText += a.join(`|`)
        })

        rxText += `|` + char.equal + ")" //Adding Equal sign too.
        this._rxPunctuators = new RegExp(rxText, "gim")
    }

    fromString(code: string): void {

        this._code = code;
        this._setType(code);
        this._punctQueue = []
        let lines: string[] = this._extractCodelines(code)
        let isOpenString: boolean = false

        lines.forEach((line, i) => {
            let match: RegExpExecArray | null
            let pv: ParameterValue | null = null;

            while ((match = this._rxPunctuators.exec(line)) !== null) {

                //If current item is a string, we just need to wait for the closing punctuator:
                if (isOpenString) {
                    if (this._removeFromQueue(match[0])) {
                        isOpenString = false
                    }
                }
                else {
                    //If is an Open punctuator like a "@{" defining a new Hashtable, "@'" indicating 
                    //the beginning of a Here string, etc.:
                    if (this._punct.has(match[0])) {
                        this._addToQueue(this._punct.get(match[0])!) //Adding the matching close punctuator.
                        isOpenString = this._isStringOpener(match[0])
                    }
                    else { //Is a close punctuator, (like: close block "}", end of a string "'", etc) or 
                        //an equality sign, ("=").

                        //Equality sign is not in the punctuators list. So, any other must be the close 
                        //punctuator we expect, otherwise is an error:
                        if (match[0] != "=") {
                            if (!this._removeFromQueue(match[0])) {
                                throw new PropelError(`Parsing error. We received a "${match[0]}" but we ` +
                                    `${!this._getNextFromQueue() ? "don't expect a closing tag" : "expect \"" + this._getNextFromQueue() + "\""}.`)
                            }
                        }
                    }
                }

                //If we have an equality sign and there is no open block or string, (like a previous 
                //detected value that still open), have to be a new key:
                if (match[0] == "=" && !(isOpenString || this._getNextFromQueue())) {
                    pv = new ParameterValue()
                    pv.name = this._getKey(line.substring(0, match.index))
                    if (!pv.name) {
                        throw new PropelError(`Parsing error. Not able to parse Key name in line: "${line}"`);
                    }
                    else {
                        this._setValue(line.substring(match.index + 1, line.length), pv)
                    }

                    this._values.push(pv)
                }
            }

            //If in this line we didn't identify a new key, the content have to be part of the previous key:
            if (!pv && this._getLastValue()) {
                this._appendToPreviousValue(line)
            }
        })

        if (this._getNextFromQueue()) {
            throw new PropelError(`Parsing error. Missing closing tag "${this._getNextFromQueue()}".`);
        }
    }

    fromValues(values: ParameterValue[], type?: PSType) {

        if (!values || !Array.isArray(values)) {
            values = []
        }

        this._values = values
        this._code = ""

        if (type) {
            this._type = this._parseType(type)
        }

        if (this._type == PSType.PSCustomObject) {
            this._code += `[${PSType.PSCustomObject}]`
        }

        this._code += char.at + char.lCurlyBracket

        this._values.forEach((pv, i) => {
            if(i > 0) this._code += char.semicolon + char.space

            this._code += Utils.addQuotes(pv.name) + char.equal 

            if (pv.nativeType == PSType.String) {
                this._code += char.doubleQuote + pv.value + char.doubleQuote
            }
            else {
                this._code += pv.value
            }
        })

        this._code += char.rCurlyBracket
    }

    private _getKey(key: string): string {
        let ret: string = ""
        key = key.trim()

        //If the key is quoted like "My Field" = ******:
        if (Utils.isQuotedString(key)) {
            ret = Utils.removeQuotes(key)
        }
        //If the key was not quoted and starts with "_" or an alphanumeric character and also do not 
        //include spaces or non alphanumeric characters, means is a valid key: 
        else if (key.match(/^[_A-za-z]/gi) && !key.match(/(\s+|\W+)/gi)) {
            ret = key
        }

        return ret
    }

    private _getLastValue(): ParameterValue | undefined {
        if (this.values.length > 0) {
            return this.values[this.values.length - 1]
        }

        return undefined
    }

    private _appendToPreviousValue(line: string) {
        let last = this._getLastValue()

        if (!line.trim()) return
        if (!last) throw new PropelError(`There is no previous value to add the line "${line}".`);

        this._setValue(line, last)
    }

    private _setValue(value: string, pv: ParameterValue): void {
        this._setIfString(value, pv);
        this._setIfNumber(value, pv);
        this._setIfObject(value, pv);
    }

    private _setIfString(value: string, pv: ParameterValue): void {
        let isString: boolean = false

        if (pv.nativeType && pv.nativeType != PSType.String) return;

        //Checking if is a String literal:
        if (!pv.value && this._hasStringLiteralStart(value)) {
            value = value.trim().substring(1)
            isString = true
        }
        // if (!pv.value && this._hasStringLiteralEnd(value)) {
        if ((isString || pv.nativeType == PSType.String) && this._hasStringLiteralEnd(value)) {
            value = value.trim().substring(0, value.trim().length - 1)
        }

        if (isString || pv.nativeType == PSType.String) {
            pv.nativeType = PSType.String

            if (!pv.value) {
                pv.value = value
            }
            else {
                pv.value += (char.newLine + value);
            }
        }
    }

    private _setIfNumber(value: string, pv: ParameterValue): void {

        if (pv.nativeType) return;

        /*If starts with +, - or a digit we will consider it a number.
        Actually there are special cases like:
            -PowerShell multipliers:
                kb	Kilobyte
                mb	Megabyte
                gb	Gigabyte
                tb	Terabyte
                pb	Petabyte
            -Hexadecimal numbers:
                Starts with "0x"
        */
        if (value.trim().match(/^([0-9]+|-[0-9]|\+[0-9])/)) {
            pv.value = value.trim()
            pv.nativeType = PSType.Decimal
        }
    }

    private _setIfObject(value: string, pv: ParameterValue): void {

        if (pv.nativeType && pv.nativeType != PSType.Object) return;

        pv.nativeType = PSType.Object

        if (!pv.value) {
            pv.value = value.trim()
        }
        else {
            pv.value += (char.newLine + value.trim());
        }
    }

    private _hasStringLiteralStart(value: string): boolean {
        return (value.trim().startsWith(char.doubleQuote) || value.trim().startsWith(char.singleQuote))
            && !(value.trim().startsWith(char.at + char.doubleQuote) || 
                value.trim().startsWith(char.at + char.singleQuote) ||
                value.trim().startsWith(char.doubleQuote + char.at) || 
                value.trim().startsWith(char.singleQuote + char.at))
    }

    private _hasStringLiteralEnd(value: string): boolean {
        return (value.trim().endsWith(char.doubleQuote) || value.trim().endsWith(char.singleQuote))
            && !(value.trim().endsWith(char.at + char.doubleQuote) || 
                value.trim().endsWith(char.at + char.singleQuote) ||
                value.trim().endsWith(char.doubleQuote + char.at) || 
                value.trim().endsWith(char.singleQuote + char.at))
    }

    private _setType(code: string): void {
        let startSB = "\\[\\s*"
        let endSB = "\\s*\\]"
        let startHT = "\\s*@{"
        let rx = new RegExp(`^${startSB}[a-zA-Z._]+${endSB}${startHT}`, "gi")
        let type: string = ""

        let match = code
            .trim()
            .match(rx)

        if (match) {
            type = match[0]
                .replace(new RegExp(startSB, "gi"), "")
                .replace(new RegExp(endSB, "gi"), "")
                .replace(new RegExp(startHT, "gi"), "")

            this._type = this._parseType(type)
        }
    }

    private _parseType(type: string): PSType {
        let ret: PSType;
        let matchType = this._allowedTypeDescriptors.find((t) => type.trim().toLowerCase().endsWith(t))

        switch (matchType) {
            case "hashtable":
                ret = PSType.Hashtable
                break;
            case "pscustomobject":
                ret = PSType.PSCustomObject
                break;
            case "object":
                ret = PSType.Object
                break;
            default:
                throw new PropelError(`The specified type "${type}" is not allowed.
Allowed types are: ${this._allowedTypeDescriptors.join(",")}.`)
        }

        return ret
    }

    private _extractCodelines(code: string): string[] {
        let rxContainHashTable = new RegExp("@{(\\w|\\W)+}", "gi")
        let match = code.match(rxContainHashTable)

        if (!match) return []  //Invalid or empty hashtable.

        return match[0].substring(2) //Removing the initial "@{"
            .slice(0, -1) //Removing the last "}"
            .replace(new RegExp(char.carriageReturn+char.newLine, "gi"), char.newLine) //Replacing CR-LF chars by a simple LF
            .replace(new RegExp(char.semicolon, "gi"), char.newLine) //Replacing any end of statement char,(";"), by a LF
            .split(char.newLine) //Splitting by line feeds.
    }

    private _addToQueue(punct: string) {
        this._punctQueue.push(punct)
    }

    private _removeFromQueue(punct: string) {
        if (punct && this._getNextFromQueue() == punct) {
            this._punctQueue.pop()
            return true
        }

        return false
    }

    private _getNextFromQueue(): string {
        if (this._punctQueue && this._punctQueue.length > 0) return this._punctQueue[this._punctQueue.length - 1]
        return ""
    }

    private _isStringOpener(punct: string) {
        return (punct == char.at + char.doubleQuote || punct == char.at + char.singleQuote ||
            punct == char.singleQuote || punct == char.doubleQuote)
    }
}
