import { Utils } from "../../utils/utils";

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

describe("Utils Class - detectJSON()", () => {

    describe("Invalid or no JSON in supplied text", () => {

        test(`With null argument`, () => {
            //@ts-ignore
            expect(Utils.detectJSON(null)).toBe(null);
        })
        test(`With empty string argument`, () => {
            expect(Utils.detectJSON(``)).toBe(``);
        })
        test(`With Single line of text`, () => {
            expect(Utils.detectJSON(`This is a no JSON single line`)).toBe(``);
        })
        test(`With Multiple line of text`, () => {
            expect(Utils.detectJSON(`This is a no JSON\r\nmultiple line\r\nof text\r\n\r\n`)).toBe(``);
        })
        test(`With Cross line invalid JSON Object`, () => {
            expect(Utils.detectJSON(`This is a no JSON\r\nmultiple {"data":[1,2,\r\n3]}of text}\r\n\r\n`)).toBe(``);
        })
        test(`With Cross line invalid JSON Object Array`, () => {
            expect(Utils.detectJSON(`This is a no JSON\r\nmultiple [{"data":[1,2,\r\n3]}]of text}]\r\n\r\n`)).toBe(``);
        })
        test(`JSON with adjacent text in same line`, () => {
            expect(Utils.detectJSON(`This is a no JSON\r\nadjacent text [{"data":[1,2,3]}]\r\nof text}]\r\n\r\n`)).toBe(``);
        })
        test(`Invalid JSON Object in same line`, () => {
            expect(Utils.detectJSON(`This is a no JSON\r\n{:[1,2,3]}\r\nof text}]\r\n\r\n`)).toBe(``);
        })
        test(`Invalid JSON Object Array in same line`, () => {
            expect(Utils.detectJSON(`This is a no JSON\r\n[{"data":[1,2,3]}, {"}]\r\nof text}]\r\n\r\n`)).toBe(``);
        })
        test(`Invalid formatted JSON, (breaklines not allowed into JSON)`, () => {
            expect(Utils.detectJSON(`This a line\r\n
            {
                "data":  [
                             8,
                             9
                         ]
            }\r\nAnother line`)).toBe(``);
        })
    })
    describe("Valid JSON in supplied text", () => {

        test(`With compressed JSON`, () => {
            expect(Utils.detectJSON(`This a line\r\n\t{"data":[1,2,3]}\t\r\nAnother line`)).toBe(`{"data":[1,2,3]}`);
        })
        test(`With compressed JSON, Example 2`, () => {
            expect(Utils.detectJSON(`This a line\r\n\t{"data":"This is my data"}\t\r\nAnother line`)).toBe(`{"data":"This is my data"}`);
        })
        test(`With compressed JSON, Object Array`, () => {
            expect(Utils.detectJSON(`This a line\r\n[{"data":[1,2,3]},{"data":[4,5,6]},{"data":[7,8,9]}]\r\nAnother line`)).toBe(`[{"data":[1,2,3]},{"data":[4,5,6]},{"data":[7,8,9]}]`);
        })
    })

});