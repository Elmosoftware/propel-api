import { ParameterValue } from "../../models/parameter-value";
import { Utils } from "../../utils/utils";

enum StringValuesEnum {
    First = "1st",
    Second = "2nd",
    Third = "3rd"
}

enum NumberValuesEnum {
    Zero = 0,
    One = 1,
    Two = 2,
    Three = 3
}


describe("Utils Class - isObject()", () => {

    test(`isObject(null)`, () => {
        expect(Utils.isObject(null)).toEqual(false);
    })
    test(`isObject(undefined)`, () => {
        expect(Utils.isObject(undefined)).toEqual(false);
    })
    test(`isObject(123)`, () => {
        expect(Utils.isObject(123)).toEqual(false);
    })
    test(`isObject(123.45)`, () => {
        expect(Utils.isObject(123.45)).toEqual(false);
    })
    test(`isObject(true)`, () => {
        expect(Utils.isObject(true)).toEqual(false);
    })
    test(`isObject(false)`, () => {
        expect(Utils.isObject(false)).toEqual(false);
    })
    test(`isObject(new Date())`, () => {
        expect(Utils.isObject(new Date())).toEqual(true);
    })
    test(`isObject([])`, () => {
        expect(Utils.isObject([])).toEqual(true);
    })
    test(`isObject("")`, () => {
        expect(Utils.isObject("")).toEqual(false);
    })
    test(`isObject("sample string")`, () => {
        expect(Utils.isObject("sample string")).toEqual(false);
    })
    test(`isObject({})`, () => {
        expect(Utils.isObject({})).toEqual(true);
    })
    test(`isObject({attr: "Hello!"})`, () => {
        expect(Utils.isObject({ attr: "Hello!" })).toEqual(true);
    })
})

describe("Utils Class - isEmptyObject()", () => {

    test(`isEmptyObject(null)`, () => {
        expect(Utils.isEmptyObject(null)).toEqual(false);
    })
    test(`isEmptyObject(undefined)`, () => {
        expect(Utils.isEmptyObject(undefined)).toEqual(false);
    })
    test(`isEmptyObject(123)`, () => {
        expect(Utils.isEmptyObject(123)).toEqual(false);
    })
    test(`isEmptyObject(123.45)`, () => {
        expect(Utils.isEmptyObject(123.45)).toEqual(false);
    })
    test(`isEmptyObject(true)`, () => {
        expect(Utils.isEmptyObject(true)).toEqual(false);
    })
    test(`isEmptyObject(false)`, () => {
        expect(Utils.isEmptyObject(false)).toEqual(false);
    })
    test(`isEmptyObject(new Date())`, () => {
        expect(Utils.isEmptyObject(new Date())).toEqual(true);
    })
    test(`isEmptyObject([])`, () => {
        expect(Utils.isEmptyObject([])).toEqual(true);
    })
    test(`isEmptyObject("")`, () => {
        expect(Utils.isEmptyObject("")).toEqual(false);
    })
    test(`isEmptyObject("sample string")`, () => {
        expect(Utils.isEmptyObject("sample string")).toEqual(false);
    })
    test(`isEmptyObject({})`, () => {
        expect(Utils.isEmptyObject({})).toEqual(true);
    })
    test(`isEmptyObject({attr: "Hello!"})`, () => {
        expect(Utils.isEmptyObject({ attr: "Hello!" })).toEqual(false);
    })
})

describe("Utils Class - defaultIfEmptyObject()", () => {

    test(`defaultIfEmptyObject(null)`, () => {
        expect(Utils.defaultIfEmptyObject(null, { testOk: true })).toEqual(null);
    })
    test(`defaultIfEmptyObject({})`, () => {
        expect(Utils.defaultIfEmptyObject({}, { testOk: true })).toEqual({ testOk: true });
    })
    test(`defaultIfEmptyObject(undefined)`, () => {
        expect(Utils.defaultIfEmptyObject(undefined)).toEqual(undefined);
    })
    test(`defaultIfEmptyObject(123)`, () => {
        expect(Utils.defaultIfEmptyObject(123)).toEqual(123);
    })
    test(`defaultIfEmptyObject(123.45)`, () => {
        expect(Utils.defaultIfEmptyObject(123.45)).toEqual(123.45);
    })
    test(`defaultIfEmptyObject(true)`, () => {
        expect(Utils.defaultIfEmptyObject(true)).toEqual(true);
    })
    test(`defaultIfEmptyObject(false)`, () => {
        expect(Utils.defaultIfEmptyObject(false)).toEqual(false);
    })
    test(`defaultIfEmptyObject(new Date())`, () => {
        var d = new Date()
        expect(Utils.defaultIfEmptyObject(d)).toEqual(null);
    })
    test(`defaultIfEmptyObject([])`, () => {
        expect(Utils.defaultIfEmptyObject([])).toEqual(null);
    })
    test(`defaultIfEmptyObject("")`, () => {
        expect(Utils.defaultIfEmptyObject("")).toEqual("");
    })
    test(`defaultIfEmptyObject("sample string")`, () => {
        expect(Utils.defaultIfEmptyObject("sample string")).toEqual("sample string");
    })
    test(`defaultIfEmptyObject({})`, () => {
        expect(Utils.defaultIfEmptyObject({})).toEqual(null);
    })
    test(`defaultIfEmptyObject({attr: "Hello!"})`, () => {
        expect(Utils.defaultIfEmptyObject({ attr: "Hello!" })).toEqual({ attr: "Hello!" });
    })
})

describe("Utils Class - capitalize()", () => {
    test(`capitalize(null)`, () => {
        expect(Utils.capitalize(null)).toEqual("");
    })
    test(`capitalize(undefined)`, () => {
        expect(Utils.capitalize(undefined)).toEqual("");
    })
    test(`capitalize("")`, () => {
        expect(Utils.capitalize(null)).toEqual("");
    })
    test(`capitalize(234)`, () => {
        expect(Utils.capitalize(234)).toEqual("234");
    })
    test(`capitalize(156.45)`, () => {
        expect(Utils.capitalize(156.45)).toEqual("156.45");
    })
    test(`capitalize({})`, () => {
        expect(Utils.capitalize({})).toEqual("[object Object]");
    })
    test(`capitalize(true)`, () => {
        expect(Utils.capitalize(true)).toEqual("True");
    })
    test(`capitalize(false)`, () => {
        expect(Utils.capitalize(false)).toEqual("False");
    })
    test(`capitalize(["text"])`, () => {
        expect(Utils.capitalize(["text"])).toEqual("Text");
    })
    test(`capitalize([4567, "text"])`, () => {
        expect(Utils.capitalize([4567, "text"])).toEqual("4567,text");
    })
    test(`capitalize("abracadabra")`, () => {
        expect(Utils.capitalize("abracadabra")).toEqual("Abracadabra");
    })
    test(`capitalize("Abracadabra")`, () => {
        expect(Utils.capitalize("Abracadabra")).toEqual("Abracadabra");
    })
    test(`capitalize("ABRACADABRA")`, () => {
        expect(Utils.capitalize("ABRACADABRA")).toEqual("ABRACADABRA");
    })
})

describe("Utils Class - isValidJSON()", () => {
    test(`isValidJSON(undefined)`, () => {
        //@ts-ignore
        expect(Utils.isValidJSON(undefined)).toBe(false);
    })
    test(`isValidJSON("")`, () => {
        expect(Utils.isValidJSON("")).toBe(false);
    })
    test(`isValidJSON("invalid")`, () => {
        expect(Utils.isValidJSON("invalid")).toBe(false);
    })
    test(`isValidJSON(".")`, () => {
        expect(Utils.isValidJSON(".")).toBe(false);
    })
    test(`isValidJSON(null)`, () => {
        //@ts-ignore
        expect(Utils.isValidJSON(null)).toBe(true);
    })
    test(`isValidJSON("Valid JSON 01")`, () => {
        expect(Utils.isValidJSON(`{}`)).toBe(true);
    })
    test(`isValidJSON("Valid JSON 02")`, () => {
        expect(Utils.isValidJSON(`
        {  
            "employee": {  
                "name":       "sonoo",   
                "salary":      56000,   
                "married":    true  
            }  
        }  `)).toBe(true);
    })
    test(`isValidJSON("Valid JSON 02")`, () => {
        expect(Utils.isValidJSON(`["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]`)).toBe(true);
    })
    test(`isValidJSON("Valid JSON 03")`, () => {
        expect(Utils.isValidJSON(`[  
            {"name":"Ram", "email":"Ram@gmail.com"},  
            {"name":"Bob", "email":"bob32@gmail.com"}  
        ]`)).toBe(true);
    })
    test(`isValidJSON("Valid JSON 04")`, () => {
        expect(Utils.isValidJSON(`{
            "menu": {  
                "id": "file",  
                "value": "File",  
                "popup": {  
                    "menuitem": [  
                        {"value": "New", "onclick": "CreateDoc()"},  
                        {"value": "Open", "onclick": "OpenDoc()"},  
                        {"value": "Save", "onclick": "SaveDoc()"}  
                    ]  
                }  
          }}`)).toBe(true);
    })
    test(`isValidJSON("Valid JSON 05")`, () => {
        expect(Utils.isValidJSON(`{  
            "integer": 34,  
            "fraction": 0.2145,  
            "exponent": 6.61789e+0  
            }`)).toBe(true);
    })
    test(`isValidJSON("Valid JSON 06")`, () => {
        expect(Utils.isValidJSON(`[    
            [ "a", "b", "c" ],   
            [ "m", "n", "o" ],   
            [ "x", "y", "z" ]   
           ]`)).toBe(true);
    })
})

describe("Utils Class - isQuotedString()", () => {

    test(`isQuotedString(null)`, () => {
        //@ts-ignore
        expect(Utils.isQuotedString(null)).toEqual(false);
    })
    test(`isQuotedString(undefined)`, () => {
        //@ts-ignore
        expect(Utils.isQuotedString(undefined)).toEqual(false);
    })
    test(`isQuotedString("Hello world")`, () => {
        //@ts-ignore
        expect(Utils.isQuotedString("Hello world")).toEqual(false);
    })
    test(`isQuotedString("Hello"world")`, () => {
        //@ts-ignore
        expect(Utils.isQuotedString("Hello\"world")).toEqual(false);
    })
    test(`isQuotedString("'Hello world")`, () => {
        //@ts-ignore
        expect(Utils.isQuotedString("'Hello world")).toEqual(false);
    })
    test(`isQuotedString("Hello world'")`, () => {
        //@ts-ignore
        expect(Utils.isQuotedString("Hello world'")).toEqual(false);
    })
    test(`isQuotedString(""Hello world")`, () => {
        //@ts-ignore
        expect(Utils.isQuotedString("\"Hello world")).toEqual(false);
    })
    test(`isQuotedString("Hello world"")`, () => {
        //@ts-ignore
        expect(Utils.isQuotedString("Hello world\"")).toEqual(false);
    })
    test(`isQuotedString("'Hello world'")`, () => {
        //@ts-ignore
        expect(Utils.isQuotedString("'Hello world'")).toEqual(true);
    })
    test(`isQuotedString(""Hello world2"")`, () => {
        //@ts-ignore
        expect(Utils.isQuotedString("\"Hello world\"")).toEqual(true);
    })
})

describe("Utils Class - addQuotes()", () => {

    test(`addQuotes(null)`, () => {
        //@ts-ignore
        expect(Utils.addQuotes(null)).toBe(null);
    })
    test(`addQuotes(undefined)`, () => {
        //@ts-ignore
        expect(Utils.addQuotes(undefined)).toBe(undefined);
    })
    test(`addQuotes("Hello world")`, () => {
        //@ts-ignore
        expect(Utils.addQuotes("Hello world")).toEqual("\"Hello world\"");
    })
    test(`addQuotes("Hello"world")`, () => {
        //@ts-ignore
        expect(Utils.addQuotes("Hello\"world")).toEqual("\"Hello\"world\"");
    })
    test(`addQuotes("'Hello world")`, () => {
        //@ts-ignore
        expect(Utils.addQuotes("'Hello world")).toEqual("\"'Hello world\"");
    })
    test(`addQuotes("Hello world'")`, () => {
        //@ts-ignore
        expect(Utils.addQuotes("Hello world'")).toEqual("\"Hello world'\"");
    })
    test(`addQuotes(""Hello world")`, () => {
        //@ts-ignore
        expect(Utils.addQuotes("\"Hello world")).toEqual("\"\"Hello world\"");
    })
    test(`addQuotes(""Hello world"")`, () => {
        //@ts-ignore
        expect(Utils.addQuotes("\"Hello world\"")).toEqual("\"Hello world\"");
    })
    test(`addQuotes("'Hello world'")`, () => {
        //@ts-ignore
        expect(Utils.addQuotes("'Hello world'")).toEqual("'Hello world'");
    })
})

describe("Utils Class - removeQuotes()", () => {

    test(`removeQuotes(null)`, () => {
        //@ts-ignore
        expect(Utils.removeQuotes(null)).toBe(null);
    })
    test(`removeQuotes(undefined)`, () => {
        //@ts-ignore
        expect(Utils.removeQuotes(undefined)).toBe(undefined);
    })
    test(`removeQuotes("Hello world")`, () => {
        //@ts-ignore
        expect(Utils.removeQuotes("Hello world")).toEqual("Hello world");
    })
    test(`addQuotes("Hello"world")`, () => {
        //@ts-ignore
        expect(Utils.addQuotes("Hello\"world")).toEqual("\"Hello\"world\"");
    })
    test(`removeQuotes("'Hello world")`, () => {
        //@ts-ignore
        expect(Utils.removeQuotes("'Hello world")).toEqual("'Hello world");
    })
    test(`removeQuotes("Hello world'")`, () => {
        //@ts-ignore
        expect(Utils.removeQuotes("Hello world'")).toEqual("Hello world'");
    })
    test(`removeQuotes(""Hello world")`, () => {
        //@ts-ignore
        expect(Utils.removeQuotes("\"Hello world")).toEqual("\"Hello world");
    })
    test(`removeQuotes(""Hello world"")`, () => {
        //@ts-ignore
        expect(Utils.removeQuotes("\"Hello world\"")).toEqual("Hello world");
    })
    test(`removeQuotes("'Hello world'")`, () => {
        //@ts-ignore
        expect(Utils.removeQuotes("'Hello world'")).toEqual("Hello world");
    })
})

describe("Utils Class - JavascriptToPowerShellValueConverter()", () => {
    test(`With null reference`, () => {
        //@ts-ignore
        let pv: ParameterValue = null;
        Utils.JavascriptToPowerShellValueConverter(pv)
        expect(pv).toEqual(null);
    })
    test(`For Object Native type - No changes in value`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "Object";
        //@ts-ignore
        pv.value = null
        Utils.JavascriptToPowerShellValueConverter(pv)
        expect(pv.value).toEqual(null);
    })
    test(`For Boolean Native type with a Boolean value "true" - must be converted to "$true"`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "Boolean";
        //@ts-ignore
        pv.value = true
        Utils.JavascriptToPowerShellValueConverter(pv)
        expect(pv.value).toEqual("$true");
    })
    test(`For Boolean Native type with a Boolean value "false" - must be converted to "$false"`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "Boolean";
        //@ts-ignore
        pv.value = false
        Utils.JavascriptToPowerShellValueConverter(pv)
        expect(pv.value).toEqual("$false");
    })
    test(`For Boolean Native type with a Boolean value "null" - must be converted to "$false"`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "Boolean";
        //@ts-ignore
        pv.value = null
        Utils.JavascriptToPowerShellValueConverter(pv)
        expect(pv.value).toEqual("$false");
    })
    test(`For Boolean Native type with a String value "true" - must be converted to "$true"`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "Boolean";
        //@ts-ignore
        pv.value = "true"
        Utils.JavascriptToPowerShellValueConverter(pv)
        expect(pv.value).toEqual("$true");
    })
    test(`For Boolean Native type with a String value "false" - must be converted to "$false"`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "Boolean";
        //@ts-ignore
        pv.value = "false"
        Utils.JavascriptToPowerShellValueConverter(pv)
        expect(pv.value).toEqual("$false");
    })
    test(`For Boolean Native type with a String value that is neither "true" nor "false" - must be converted to "$false"`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "Boolean";
        //@ts-ignore
        pv.value = "any value here"
        Utils.JavascriptToPowerShellValueConverter(pv)
        expect(pv.value).toEqual("$false");
    })
    test(`For String Native type with any value that is not an empty string - original value must be preserved.`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "String";
        //@ts-ignore
        pv.value = "any value here"
        Utils.JavascriptToPowerShellValueConverter(pv)
        expect(pv.value).toEqual("any value here");
    })
    test(`For String Native type with an empty string value - original value must be preserved.`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "String";
        //@ts-ignore
        pv.value = ""
        Utils.JavascriptToPowerShellValueConverter(pv)
        expect(pv.value).toEqual("");
    })
    test(`For a Native type other than "String" and "Boolean" with any value that is not and empty string - original value must be preserved.`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "Array";
        //@ts-ignore
        pv.value = "any value here"
        Utils.JavascriptToPowerShellValueConverter(pv)
        expect(pv.value).toEqual("any value here");
    })
    test(`For a Native type other than "String" and "Boolean" with an empty string as value - original value must be changes by "$null".`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "Array";
        //@ts-ignore
        pv.value = ""
        Utils.JavascriptToPowerShellValueConverter(pv)
        expect(pv.value).toEqual("$null");
    })
    test(`For a "String" Native type that not contains double quotes, ("), the value must remain unchanged.`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "String";
        //@ts-ignore
        pv.value = "Hello"
        Utils.JavascriptToPowerShellValueConverter(pv)
        expect(pv.value).toEqual("Hello");
    })
    test(`For a "String" Native type that contains double quotes, ("), that char must be replaced by a backtick plus a double quote, (\`").`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "String";
        //@ts-ignore
        pv.value = "\"Hello\""
        Utils.JavascriptToPowerShellValueConverter(pv)
        expect(pv.value).toEqual("`\"Hello`\"");
    })
    test(`For a "String" Native type that contains single quotes, ('), the value must remain unchanged.`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "String";
        //@ts-ignore
        pv.value = "'Hello'"
        Utils.JavascriptToPowerShellValueConverter(pv)
        expect(pv.value).toEqual("'Hello'");
    })
})

describe("Utils Class - PowershellToJavascriptValueConverter()", () => {
    test(`With null reference`, () => {
        //@ts-ignore
        let pv: ParameterValue = null;
        Utils.PowerShellToJavascriptValueConverter(pv)
        expect(pv).toEqual(null);
    })
    test(`For Object Native type - No changes in value`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "Object";
        //@ts-ignore
        pv.value = null
        Utils.PowerShellToJavascriptValueConverter(pv)
        expect(pv.value).toEqual(null);
    })
    test(`For Boolean Native type with a Boolean value "true" - original value must be preserved`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "Boolean";
        //@ts-ignore
        pv.value = true
        Utils.PowerShellToJavascriptValueConverter(pv)
        expect(pv.value).toEqual(true);
    })
    test(`For Boolean Native type with a Boolean value "false" - original value must be preserved`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "Boolean";
        //@ts-ignore
        pv.value = false
        Utils.PowerShellToJavascriptValueConverter(pv)
        expect(pv.value).toEqual(false);
    })
    test(`For Boolean Native type with a Boolean value "null" - must be converted to "false"`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "Boolean";
        //@ts-ignore
        pv.value = null
        Utils.PowerShellToJavascriptValueConverter(pv)
        expect(pv.value).toEqual(false);
    })
    test(`For Boolean Native type with a String value "$true" - must be converted to "true"`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "Boolean";
        //@ts-ignore
        pv.value = "$true"
        Utils.PowerShellToJavascriptValueConverter(pv)
        expect(pv.value).toEqual(true);
    })
    test(`For Boolean Native type with a String value "$false" - must be converted to "false"`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "Boolean";
        //@ts-ignore
        pv.value = "$false"
        Utils.PowerShellToJavascriptValueConverter(pv)
        expect(pv.value).toEqual(false);
    })
    test(`For Boolean Native type with a String value that is neither "$true" nor "$false" - must be converted to "false"`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "Boolean";
        //@ts-ignore
        pv.value = "any value here"
        Utils.PowerShellToJavascriptValueConverter(pv)
        expect(pv.value).toEqual(false);
    })
    test(`For String Native type with any value that is not and empty string - original value must be preserved.`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "String";
        //@ts-ignore
        pv.value = "any value here"
        Utils.PowerShellToJavascriptValueConverter(pv)
        expect(pv.value).toEqual("any value here");
    })
    test(`For String Native type with an empty string value - original value must be preserved.`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "String";
        //@ts-ignore
        pv.value = ""
        Utils.PowerShellToJavascriptValueConverter(pv)
        expect(pv.value).toEqual("");
    })
    test(`For a Native type other than "String" and "Boolean" with any value that is not and empty string - original value must be preserved.`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "Array";
        //@ts-ignore
        pv.value = "any value here"
        Utils.PowerShellToJavascriptValueConverter(pv)
        expect(pv.value).toEqual("any value here");
    })
    test(`For a Native type other than "String" and "Boolean" with the value "$null" - original value must be changed to an empty string.`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "Array";
        //@ts-ignore
        pv.value = "$null"
        Utils.PowerShellToJavascriptValueConverter(pv)
        expect(pv.value).toEqual("");
    })
    test(`For a "String" Native type that not contains double quotes, ("), the value must remain unchanged.`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "String";
        //@ts-ignore
        pv.value = "Hello"
        Utils.PowerShellToJavascriptValueConverter(pv)
        expect(pv.value).toEqual("Hello");
    })
    test(`For a "String" Native type that contains a backtick plus a double quote, (\`"), it must be replaced by double quotes, (").`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "String";
        //@ts-ignore
        pv.value = "`\"Hello`\""
        Utils.PowerShellToJavascriptValueConverter(pv)
        expect(pv.value).toEqual("\"Hello\"");
    })
    test(`For a "String" Native type that contains single quotes, ('), the value must remain unchanged.`, () => {
        let pv = new ParameterValue();
        pv.nativeType = "String";
        //@ts-ignore
        pv.value = "'Hello'"
        Utils.PowerShellToJavascriptValueConverter(pv)
        expect(pv.value).toEqual("'Hello'");
    })
})

describe("Utils Class - getNextDuplicateName()", () => {
    test(`With empty Master name and empty list of names.`, () => {
        expect(Utils.getNextDuplicateName("", [])).toEqual("");
    })
    test(`With Master name and empty list of names.`, () => {
        expect(Utils.getNextDuplicateName("My incredible item", [])).toEqual("My incredible item (Duplicate)");
    })
    test(`With Master name and not empty list of names.`, () => {
        expect(Utils.getNextDuplicateName("My incredible item", ["Non related Item", "Non related Item", 
            "Non related Item"]))
            .toEqual("My incredible item (Duplicate)");
    })
    test(`With Master name and list of names without dups.`, () => {
        expect(Utils.getNextDuplicateName("My incredible item", ["My incredible item"]))
            .toEqual("My incredible item (Duplicate)");
    })
    test(`With Master name and list of names with one dup.`, () => {
        expect(Utils.getNextDuplicateName("My incredible item", ["My incredible item", "My incredible item (Duplicate)"]))
            .toEqual("My incredible item (Duplicate 2)");
    })
    test(`With Master name and list of names with two dup.`, () => {
        expect(Utils.getNextDuplicateName("My incredible item", ["My incredible item", "My incredible item (Duplicate)", "My incredible item (Duplicate 2)"]))
            .toEqual("My incredible item (Duplicate 3)");
    })
    test(`With Master name and list of names with one dup, (non sequential).`, () => {
        expect(Utils.getNextDuplicateName("My incredible item", ["My incredible item", "My incredible item (Duplicate 45)"]))
            .toEqual("My incredible item (Duplicate 46)");
    })
    test(`With Master name and list of names with wrong dups.`, () => {
        expect(Utils.getNextDuplicateName("My incredible item", ["My incredible item", "My incredible item (Duplicate 4a)", "My incredible item (Duplicate -1)"]))
            .toEqual("My incredible item (Duplicate)");
    })
    test(`With Master name and list of valid and not valid test names.`, () => {
        expect(Utils.getNextDuplicateName("xxxx", ["xxxx", "xxxx (Duplicate 2)", "xxxx (Duplicate carat)", "xxxx (Duplicate)"]))
            .toEqual("xxxx (Duplicate 3)");
    })
    test(`With Master name with already "(Duplicate)" inthe nme and list of single current names.`, () => {
        expect(Utils.getNextDuplicateName("xxxx (Duplicate) (Duplicate)", ["xxxx (Duplicate) (Duplicate)"]))
            .toEqual("xxxx (Duplicate) (Duplicate) (Duplicate)");
    })    
})

describe("Utils Class - testEnumKey()", () => {

    test(`Missing Enumeration type`, () => {
        expect(Utils.testEnumKey(null, "")).toEqual(false);
    })
    test(`String enum with empty string value as key`, () => {
        expect(Utils.testEnumKey(StringValuesEnum, "")).toEqual(false);
    })
    test(`String enum with null value as key`, () => {
        //@ts-ignore
        expect(Utils.testEnumKey(StringValuesEnum, null)).toEqual(false);
    })
    test(`String enum with invalid value as key`, () => {
        //@ts-ignore
        expect(Utils.testEnumKey(StringValuesEnum, "NotExistentKey")).toEqual(false);
    })
    test(`String enum with valid value as key (caseSensitive = true)`, () => {
        //@ts-ignore
        expect(Utils.testEnumKey(StringValuesEnum, "First")).toEqual(true);
    })
    test(`String enum with valid value as key (caseSensitive = false)`, () => {
        //@ts-ignore
        expect(Utils.testEnumKey(StringValuesEnum, "firST", false)).toEqual(true);
    })
    test(`Number enum with empty string value as key (caseSensitive = true)`, () => {
        expect(Utils.testEnumKey(NumberValuesEnum, "")).toEqual(false);
    })
    test(`Number enum with empty string value as key (caseSensitive = false)`, () => {
        expect(Utils.testEnumKey(NumberValuesEnum, "", false)).toEqual(false);
    })
    test(`Number enum with null value as key`, () => {
        //@ts-ignore
        expect(Utils.testEnumKey(NumberValuesEnum, null)).toEqual(false);
    })
    test(`Number enum with invalid value as key`, () => {
        //@ts-ignore
        expect(Utils.testEnumKey(NumberValuesEnum, 34)).toEqual(false);
    })
    test(`Number enum with valid value as key, (non-zero) (caseSensitive = true)`, () => {
        //@ts-ignore
        expect(Utils.testEnumKey(NumberValuesEnum, "Two")).toEqual(true);
    })
    test(`Number enum with valid value as key, (non-zero) (caseSensitive = false)`, () => {
        //@ts-ignore
        expect(Utils.testEnumKey(NumberValuesEnum, "tWO", false)).toEqual(true);
    })
    test(`Number enum with valid value as key, (zero) (caseSensitive = true)`, () => {
        //@ts-ignore
        expect(Utils.testEnumKey(NumberValuesEnum, "Zero")).toEqual(true);
    })
    test(`Number enum with valid value as key, (zero) (caseSensitive = false)`, () => {
        //@ts-ignore
        expect(Utils.testEnumKey(NumberValuesEnum, "ZeRO", false)).toEqual(true);
    })
})

describe("Utils Class - getEnumValue()", () => {

    test(`Missing Enumeration type`, () => {
        expect(Utils.getEnumValue(null, "")).toBe(undefined);
    })
    test(`String enum with null value as key`, () => {
        //@ts-ignore
        expect(Utils.getEnumValue(StringValuesEnum, null)).toBe(undefined);
    })
    test(`String enum with non existent key`, () => {
        expect(Utils.getEnumValue(StringValuesEnum, "NotExistentKey")).toBe(undefined);
    })
    test(`String enum with valid value as key (caseSensitive = true)`, () => {
        expect(Utils.getEnumValue(StringValuesEnum, "First")).toEqual("1st");
    })
    test(`String enum with valid value as key (caseSensitive = false)`, () => {
        //@ts-ignore
        expect(Utils.getEnumValue(StringValuesEnum, "firST", false)).toEqual("1st");
    })
    test(`Number enum with empty string value as key (caseSensitive = true)`, () => {
        expect(Utils.getEnumValue(NumberValuesEnum, "")).toBe(undefined);
    })
    test(`Number enum with empty string value as key (caseSensitive = false)`, () => {
        expect(Utils.getEnumValue(NumberValuesEnum, "", false)).toBe(undefined);
    })
    test(`Number enum with null value as key`, () => {
        //@ts-ignore
        expect(Utils.getEnumValue(NumberValuesEnum, null)).toBe(undefined);
    })
    test(`Number enum with invalid value as key`, () => {
        //@ts-ignore
        expect(Utils.getEnumValue(NumberValuesEnum, 34)).toBe(undefined);
    })
    test(`Number enum with valid value as key, (non-zero) (caseSensitive = true)`, () => {
        //@ts-ignore
        expect(Utils.getEnumValue(NumberValuesEnum, "Two")).toEqual(2);
    })
    test(`Number enum with valid value as key, (non-zero) (caseSensitive = false)`, () => {
        //@ts-ignore
        expect(Utils.getEnumValue(NumberValuesEnum, "tWO", false)).toEqual(2);
    })
    test(`Number enum with valid value as key, (zero) (caseSensitive = true)`, () => {
        //@ts-ignore
        expect(Utils.getEnumValue(NumberValuesEnum, "Zero")).toEqual(0);
    })
    test(`Number enum with valid value as key, (zero) (caseSensitive = false)`, () => {
        //@ts-ignore
        expect(Utils.getEnumValue(NumberValuesEnum, "ZeRO", false)).toEqual(0);
    })
})

describe("Utils Class - getEnum", () => {

    test(`Missing Enumeration type`, () => {
        expect(Utils.getEnum(null)).toEqual([]);
    })
    test(`String values Enumeration`, () => {
        expect(Utils.getEnum(StringValuesEnum)).toEqual([
            {key: "First", value: "1st"},
            {key: "Second", value: "2nd"},
            {key: "Third", value: "3rd"}
        ]);
    })
    test(`Number values Enumeration`, () => {
        expect(Utils.getEnum(NumberValuesEnum)).toEqual([
            {key: "Zero", value: 0},
            {key: "One", value: 1},
            {key: "Two", value: 2},
            {key: "Three", value: 3}
        ]);
    })
})