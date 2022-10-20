import { ParameterValueConverter } from "../../core/value-converter";
import { JSType, PowerShellLiterals } from "../../core/type-definitions";
import { ParameterValue } from "../../models/parameter-value";

describe("ParameterValueConverter Class - Invalid Parameters", () => {

    let pv: ParameterValue

    beforeEach(() => {
        pv = new ParameterValue()
        pv.name = "MyParam"
        pv.nativeType = JSType.String
        pv.value = ""
    })

    test(`Null value`, () => {
        expect(() => {
            //@ts-ignore
            ParameterValueConverter.toJavascript(null)
        }).toThrow(`A ParameterValue instance was expected`);
    })
    test(`Not a valid Native JS Type`, () => {
        expect(() => {
            pv.nativeType = "unknown type"
            ParameterValueConverter.toPowerShell(pv)
        }).toThrow(`The specified Javascript type doesn't exists`);
    })
})

describe("ParameterValueConverter Class - toJavascript()", () => {

    let pv: ParameterValue

    beforeEach(() => {
        pv = new ParameterValue()
        pv.name = "MyParam"
        pv.nativeType = JSType.Object
        pv.value = ""
    })
    
    describe("Object", () => {
        test(`null value`, () => {
            pv.value = null
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual("");
        })
        test(`undefined value`, () => {
            pv.value = undefined
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual("");
        })
        test(`PowerSHell literal $null value`, () => {
            pv.value = PowerShellLiterals.$null
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual("");
        })
        test(`Any string value`, () => {
            pv.value = "Hola!"
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual("Hola!");
        })
    })
    describe("Boolean", () => {
        test(`A Boolean value "true"`, () => {
            pv.nativeType = JSType.Boolean
            pv.value = true
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toBe(true);
        })
        test(`A Boolean value "false"`, () => {
            pv.nativeType = JSType.Boolean
            pv.value = false
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toBe(false);
        })
        test(`A Powershell literal value "$true"`, () => {
            pv.nativeType = JSType.Boolean
            pv.value = PowerShellLiterals.$true
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toBe(true);
        })
        test(`Any other string value different than "true"`, () => {
            pv.nativeType = JSType.Boolean
            pv.value = "xxx"
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toBe(false);
        })
        test(`A null value`, () => {
            pv.nativeType = JSType.Boolean
            pv.value = null
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toBe(false);
        })
        test(`An empty array value`, () => {
            pv.nativeType = JSType.Boolean
            pv.value = []
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toBe(false);
        })
        test(`An empty object value`, () => {
            pv.nativeType = JSType.Boolean
            pv.value = {}
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toBe(false);
        })
    })
    describe("String", () => {
        test(`An empty string`, () => {
            pv.nativeType = JSType.String
            pv.value = ""
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual("");
        })
        test(`"Hello World"`, () => {
            pv.nativeType = JSType.String
            pv.value = "Hello World"
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual("Hello World");
        })
        test(`Backticked string "Hello \`"World"`, () => {
            pv.nativeType = JSType.String
            pv.value = `Hello \`"World` 
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual(`Hello "World`);
        })
    })
    describe("Array", () => {
        test(`A null value`, () => {
            pv.nativeType = JSType.Array
            pv.value = null
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual([]);
        })
        test(`An empty string`, () => {
            pv.nativeType = JSType.Array
            pv.value = ""
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual([]);
        })
        test(`A PowerShell literal $null`, () => {
            pv.nativeType = JSType.Array
            pv.value = PowerShellLiterals.$null
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual([]);
        })
        test(`A PowerShell literal empty array, "@()"`, () => {
            pv.nativeType = JSType.Array
            pv.value = PowerShellLiterals.EmptyArray
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual([]);
        })
        test(`A comma separated list of values`, () => {
            pv.nativeType = JSType.Array
            pv.value = "First, Second"
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual(["First", "Second"]);
        })
        test(`A PowerShell literal NOT empty array of strings`, () => {
            pv.nativeType = JSType.Array
            pv.value = `@("First", "Second")`
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual(["First", "Second"]);
        })
        test(`A PowerShell literal NOT empty array of numbers`, () => {
            pv.nativeType = JSType.Array
            pv.value = `@(1,2,3,4)`
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual([1,2,3,4]);
        })
    })
    describe("Date", () => {
        test(`An empty string`, () => {
            pv.nativeType = JSType.Date
            pv.value = ""
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual(PowerShellLiterals.EmptyString);
        })
        test(`An invalid string date`, () => {
            pv.nativeType = JSType.Date
            pv.value = "2099-99-99"
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual(PowerShellLiterals.EmptyString);
        })
        test(`An invalid string date and time`, () => {
            pv.nativeType = JSType.Date
            pv.value = "2023-01-01T99:67"
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual(PowerShellLiterals.EmptyString);
        })
        test(`A valid string date`, () => {
            pv.nativeType = JSType.Date
            pv.value = "2023-01-01T00:00"
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual("2023-01-01T00:00");
        })
        test(`A valid string date and time`, () => {
            pv.nativeType = JSType.Date
            pv.value = "2023-01-01T12:26"
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual("2023-01-01T12:26");
        })
        test(`A valid string UTC date and time ISO format full`, () => {
            pv.nativeType = JSType.Date
            pv.value = "2022-10-18T20:22:09.201Z"
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual("2022-10-18T17:22");
        })
    })
    describe("Number", () => {
        test(`An empty string`, () => {
            pv.nativeType = JSType.Number
            pv.value = ""
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toBe(null);
        })
        test(`A null literal value`, () => {
            pv.nativeType = JSType.Number
            pv.value = null
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toBe(null);
        })
        test(`An undefined literal value`, () => {
            pv.nativeType = JSType.Number
            pv.value = undefined
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toBe(null);
        })
        test(`A non numeric value`, () => {
            pv.nativeType = JSType.Number
            pv.value = "Hola!"
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toBe(null);
        })
        test(`A valid positive numeric value`, () => {
            pv.nativeType = JSType.Number
            pv.value = 23.456789
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual(23.456789)
        })
        test(`A valid negative numeric value`, () => {
            pv.nativeType = JSType.Number
            pv.value = -243552
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual(-243552)
        })
        test(`A string numeric value`, () => {
            pv.nativeType = JSType.Number
            pv.value = "23"
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual(23)
        })
        test(`A string numeric value not trimmed`, () => {
            pv.nativeType = JSType.Number
            pv.value = "         -345  "
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual(-345)
        })
        test(`A string floating point numeric`, () => {
            pv.nativeType = JSType.Number
            pv.value = "  8745.3445  "
            ParameterValueConverter.toJavascript(pv)
            expect(pv.value).toEqual(8745.3445)
        })
    })
})

describe("ParameterValueConverter Class - toPowerShell()", () => {

    let pv: ParameterValue

    beforeEach(() => {
        pv = new ParameterValue()
        pv.name = "MyParam"
        pv.nativeType = JSType.Object
        pv.value = ""
    })
    
    describe("Object", () => {
        test(`null value`, () => {
            pv.value = null
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual(PowerShellLiterals.$null);
        })
        test(`undefined value`, () => {
            pv.value = undefined
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual(PowerShellLiterals.$null);
        })
        test(`Empty string value`, () => {
            pv.value = ""
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual(PowerShellLiterals.$null);
        })
        test(`Powershell literal $null`, () => {
            pv.value = PowerShellLiterals.$null
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual(PowerShellLiterals.$null);
        })
        test(`A numeric value`, () => {
            pv.value = -100003.5647388
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual("-100003.5647388");
        })
        test(`A String value`, () => {
            pv.value = "Hola!"
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual("Hola!");
        })
    })
    describe("Boolean", () => {
        test(`A Boolean value "true"`, () => {
            pv.nativeType = JSType.Boolean
            pv.value = true
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toBe(PowerShellLiterals.$true);
        })
        test(`A Boolean value "false"`, () => {
            pv.nativeType = JSType.Boolean
            pv.value = false
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toBe(PowerShellLiterals.$false);
        })
        test(`A Javascript string literal value "true"`, () => {
            pv.nativeType = JSType.Boolean
            pv.value = "true"
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toBe(PowerShellLiterals.$true);
        })
        test(`Any other Javascript string value different than "true"`, () => {
            pv.nativeType = JSType.Boolean
            pv.value = "xxx"
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toBe(PowerShellLiterals.$false);
        })
        test(`A Javascript empty string`, () => {
            pv.nativeType = JSType.Boolean
            pv.value = ""
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toBe(PowerShellLiterals.$false);
        })
    })
    describe("String", () => {
        test(`An empty string`, () => {
            pv.nativeType = JSType.String
            pv.value = ""
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual(PowerShellLiterals.EmptyString);
        })
        test(`"Hello World"`, () => {
            pv.nativeType = JSType.String
            pv.value = "Hello World"
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual("Hello World");
        })
        test(`Extra quotes inside string "Hello "World"`, () => {
            pv.nativeType = JSType.String
            pv.value = `Hello "World"` 
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual(`Hello \`"World\`"`);
        })
        test(`Quoted string ""Hello World""`, () => {
            pv.nativeType = JSType.String
            pv.value = '"Hello World"' 
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual('`"Hello World`"');
        })
    })
    describe("Array", () => {
        test(`A null value`, () => {
            pv.nativeType = JSType.Array
            pv.value = null
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual(PowerShellLiterals.EmptyArray);
        })
        test(`An empty string`, () => {
            pv.nativeType = JSType.Array
            pv.value = ""
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual(PowerShellLiterals.EmptyArray);
        })
        test(`A single string value`, () => {
            pv.nativeType = JSType.Array
            pv.value = "Hola Mundo!"
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual(`@("Hola Mundo!")`);
        })
        test(`A single numeric value`, () => {
            pv.nativeType = JSType.Array
            pv.value = 123.46
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual(`@(123.46)`);
        })
        test(`An array of string values`, () => {
            pv.nativeType = JSType.Array
            pv.value = ["My", "Funny", "Valentine"]
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual(`@("My","Funny","Valentine")`);
        })
        test(`An array of numeric values`, () => {
            pv.nativeType = JSType.Array
            pv.value = [16.67, 4, -4, 34.123456]
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual(`@(16.67,4,-4,34.123456)`);
        })
    })
    describe("Date", () => {
        test(`An empty string`, () => {
            pv.nativeType = JSType.Date
            pv.value = ""
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual(PowerShellLiterals.EmptyString);
        })
        test(`An invalid string date`, () => {
            pv.nativeType = JSType.Date
            pv.value = "99/99/99"
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual(PowerShellLiterals.EmptyString);
        })
        test(`An invalid string date and time`, () => {
            pv.nativeType = JSType.Date
            pv.value = "01/01/2023 99:67"
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual(PowerShellLiterals.EmptyString);
        })
        test(`A valid string date`, () => {
            pv.nativeType = JSType.Date
            pv.value = "2023-01-01"
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual("2023-01-01T03:00:00.000Z");
        })
        test(`A valid string date and time`, () => {
            pv.nativeType = JSType.Date
            pv.value = "2023-01-01T12:26"
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual("2023-01-01T15:26:00.000Z");
        })
    })
    describe("Number", () => {
        test(`An empty string`, () => {
            pv.nativeType = JSType.Number
            pv.value = ""
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual(PowerShellLiterals.Zero);
        })
        test(`A non numeric value string`, () => {
            pv.nativeType = JSType.Number
            pv.value = "Hola!"
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual(PowerShellLiterals.Zero);
        })
        test(`A null value`, () => {
            pv.nativeType = JSType.Number
            pv.value = null
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual(PowerShellLiterals.Zero);
        })
        test(`A undefined value`, () => {
            pv.nativeType = JSType.Number
            pv.value = undefined
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual(PowerShellLiterals.Zero);
        })
        test(`A positive integer not trimmed`, () => {
            pv.nativeType = JSType.Number
            pv.value = "            345  "
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual("345");
        })
        test(`A negative integer not trimmed`, () => {
            pv.nativeType = JSType.Number
            pv.value = "            -124  "
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual("-124");
        })
        test(`A positive floating point not trimmed`, () => {
            pv.nativeType = JSType.Number
            pv.value = "            345.364535  "
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual("345.364535");
        })
        test(`A negative floating point not trimmed`, () => {
            pv.nativeType = JSType.Number
            pv.value = "            -124345.364535  "
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual("-124345.364535");
        })
        test(`A positive integer`, () => {
            pv.nativeType = JSType.Number
            pv.value = "345"
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual("345");
        })
        test(`A negative integer`, () => {
            pv.nativeType = JSType.Number
            pv.value = "-124"
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual("-124");
        })
        test(`A positive floating point`, () => {
            pv.nativeType = JSType.Number
            pv.value = "345.282909"
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual("345.282909");
        })
        test(`A negative floating point`, () => {
            pv.nativeType = JSType.Number
            pv.value = "-124.675645"
            ParameterValueConverter.toPowerShell(pv)
            expect(pv.value).toEqual("-124.675645");
        })
        
    })
})