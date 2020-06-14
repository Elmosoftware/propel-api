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

describe("Utils Class - removeEmptyLines() All lines", () => {
    test(`removeEmptyLines(null, false)`, () => {
        //@ts-ignore
        expect(Utils.removeEmptyLines(null, false)).toBe(null);
    })
    test(`removeEmptyLines(undefined, false)`, () => {
        //@ts-ignore
        expect(Utils.removeEmptyLines(undefined, false)).toBe(undefined);
    })
    test(`removeEmptyLines("", false)`, () => {
        expect(Utils.removeEmptyLines("", false)).toEqual("");
    })
    test(`removeEmptyLines("text with no lines", false)`, () => {
        expect(Utils.removeEmptyLines("text with no lines", false)).toEqual("text with no lines");
    })
    test(`removeEmptyLines("text with 2 lines\nAnd no empty lines", false)`, () => {
        expect(Utils.removeEmptyLines("text with 2 lines\nAnd no empty lines", false)).toEqual("text with 2 lines\nAnd no empty lines");
    })
    test(`removeEmptyLines("text with 3 lines\n\nAnd a middle empty line", false)`, () => {
        expect(Utils.removeEmptyLines("text with 3 lines\n\nAnd a middle empty line", false)).toEqual("text with 3 lines\nAnd a middle empty line");
    })
    test(`removeEmptyLines("text with 3 lines\n \nAnd a middle empty line with space", false)`, () => {
        expect(Utils.removeEmptyLines("text with 3 lines\n \nAnd a middle empty line with space", false)).toEqual("text with 3 lines\n \nAnd a middle empty line with space");
    })
    test(`removeEmptyLines("text with 4 lines\nThird and Fourth empty\n\n", false)`, () => {
        expect(Utils.removeEmptyLines("text with 4 lines\nThird and Fourth empty\n\n", false)).toEqual("text with 4 lines\nThird and Fourth empty");
    })
    test(`removeEmptyLines("\ntext with 5 lines\nFirst, Fourth and Fifth empty\n\n", false)`, () => {
        expect(Utils.removeEmptyLines("\ntext with 5 lines\nFirst, Fourth and Fifth empty\n\n", false)).toEqual("text with 5 lines\nFirst, Fourth and Fifth empty");
    })
    test(`removeEmptyLines("\n", false) Single empty line`, () => {
        expect(Utils.removeEmptyLines("\n", false)).toEqual("");
    })
    test(`removeEmptyLines("\n\n\n", false) Multiple empty lines`, () => {
        expect(Utils.removeEmptyLines("\n\n\n", false)).toEqual("");
    })
})

describe("Utils Class - removeEmptyLines() Only last lines", () => {
    test(`removeEmptyLines(null)`, () => {
        //@ts-ignore
        expect(Utils.removeEmptyLines(null)).toBe(null);
    })
    test(`removeEmptyLines(undefined)`, () => {
        //@ts-ignore
        expect(Utils.removeEmptyLines(undefined)).toBe(undefined);
    })
    test(`removeEmptyLines("")`, () => {
        expect(Utils.removeEmptyLines("")).toEqual("");
    })
    test(`removeEmptyLines("text with no lines")`, () => {
        expect(Utils.removeEmptyLines("text with no lines")).toEqual("text with no lines");
    })
    test(`removeEmptyLines("text with 2 lines\nAnd no empty lines")`, () => {
        expect(Utils.removeEmptyLines("text with 2 lines\nAnd no empty lines")).toEqual("text with 2 lines\nAnd no empty lines");
    })
    test(`removeEmptyLines("text with 3 lines\n\nAnd a middle empty line")`, () => {
        expect(Utils.removeEmptyLines("text with 3 lines\n\nAnd a middle empty line")).toEqual("text with 3 lines\n\nAnd a middle empty line");
    })
    test(`removeEmptyLines("text with 3 lines\n \nAnd a middle empty line with space")`, () => {
        expect(Utils.removeEmptyLines("text with 3 lines\n \nAnd a middle empty line with space")).toEqual("text with 3 lines\n \nAnd a middle empty line with space");
    })
    test(`removeEmptyLines("text with 4 lines\nThird and Fourth empty\n\n")`, () => {
        expect(Utils.removeEmptyLines("text with 4 lines\nThird and Fourth empty\n\n")).toEqual("text with 4 lines\nThird and Fourth empty");
    })
    test(`removeEmptyLines("\ntext with 5 lines\nFirst, Fourth and Fifth empty\n\n")`, () => {
        expect(Utils.removeEmptyLines("\ntext with 5 lines\nFirst, Fourth and Fifth empty\n\n")).toEqual("\ntext with 5 lines\nFirst, Fourth and Fifth empty");
    })
    test(`removeEmptyLines("\n") Single empty line`, () => {
        expect(Utils.removeEmptyLines("\n")).toEqual("");
    })
    test(`removeEmptyLines("\n\n\n") Multiple empty lines`, () => {
        expect(Utils.removeEmptyLines("\n\n\n")).toEqual("");
    })
})

describe("Utils Class - gqlPrettifier()", () => {

    test(`With empty string`, () => {
        expect(Utils.gqlPrettifier("")).toEqual("");
    })
    test(`With empty object`, () => {
        expect(Utils.gqlPrettifier("{}")).toEqual(
            `{
}`);
    })
    test(`1 field no new line`, () => {
        let result = Utils.gqlPrettifier("{Field1}");
        expect(result).toEqual(
            `{
  Field1
}`);
    })
    test(`1 Branch 1 field no new lines`, () => {
        let orig: string = `{Branch1{Branch1Field1}Field3}`
        let result = Utils.gqlPrettifier(orig);
        expect(result).toEqual(
            `{
  Branch1 {
    Branch1Field1
  }
  Field3
}`);
    })
    test(`2 fields not formatted`, () => {
        let orig: string =
            `{Field1
Field2}`
        let result = Utils.gqlPrettifier(orig);
        expect(result).toEqual(
            `{
  Field1
  Field2
}`);
    })
    test(`2 fields already prettified`, () => {
        let orig: string =
            `{
  Field1
  Field2
}`
        let result = Utils.gqlPrettifier(orig);
        expect(result).toEqual(
            `{
  Field1
  Field2
}`);
    })
    test(`2 fields plus a branch not formatted`, () => {
        let orig: string =
            `{Field1
Field2
Branch1{Branch1Field1}}`
        let result = Utils.gqlPrettifier(orig);
        expect(result).toEqual(
            `{
  Field1
  Field2
  Branch1 {
    Branch1Field1
  }
}`);
    })
    test(`4 fields plus 2 branches mixed formatting`, () => {
        let orig: string =
            `{Field1
Field2
Branch1{Branch1Field1}Field3
Branch2{   \t\tBranch2Field1
                      \tBranch2Field2}
Field4}`
        // //=====================================================
        // debugger;
        // //=====================================================
        let result = Utils.gqlPrettifier(orig);
        expect(result).toEqual(
            `{
  Field1
  Field2
  Branch1 {
    Branch1Field1
  }
  Field3
  Branch2 {
    Branch2Field1
    Branch2Field2
  }
  Field4
}`);
    })
    test(`Multiple Branches not newlines`, () => {
        let orig: string =
            `{Branch1{Branch2    {\t\t\tBranch3{Branch2Field1}}}}`

        let result = Utils.gqlPrettifier(orig);
        expect(result).toEqual(
            `{
  Branch1 {
    Branch2 {
      Branch3 {
        Branch2Field1
      }
    }
  }
}`);
    })
    test(`First as named branch`, () => {
        let orig: string =
            `NamedBranch{Branch1}`
        let result = Utils.gqlPrettifier(orig);
        expect(result).toEqual(
            `NamedBranch {
  Branch1
}`);
    })
    test(`Real world case`, () => {
        let orig: string =
            `query($id: String!){getUser(_id: $id){data{_id
email
initials
name
picture}count
totalCount}}`
        let result = Utils.gqlPrettifier(orig);
        expect(result).toEqual(
            `query($id: String!) {
  getUser(_id: $id) {
    data {
      _id
      email
      initials
      name
      picture
    }
    count
    totalCount
  }
}`);
    })
    //For invalid cases we are just interested on to not throw an exception!
    test(`Invalid extra closing braces`, () => {
        let orig: string =
            `{Branch2}}}}`
        let hasErr: Boolean = false
        try {
            Utils.gqlPrettifier(orig)
        } catch (error) {
            hasErr = true;            
        }
        expect(hasErr).toBe(false);
    })
    test(`Invalid extra opening braces`, () => {
        let orig: string =`{{{{Branch2}`
        let hasErr: Boolean = false
        try {
            Utils.gqlPrettifier(orig)
        } catch (error) {
            hasErr = true;            
        }
        expect(hasErr).toBe(false);
    })
    test(`Invalid no braces`, () => {
        let orig: string =
            `NoBraces`
        let hasErr: Boolean = false
        try {
            Utils.gqlPrettifier(orig)
        } catch (error) {
            hasErr = true;            
        }
        expect(hasErr).toBe(false);
    })
})
