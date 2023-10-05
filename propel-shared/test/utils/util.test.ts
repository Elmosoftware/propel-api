import { Credential } from "../../models/credential";
import { CredentialTypes } from "../../models/credential-types";
import { DatabaseSecret } from "../../models/database-secret";
import { GenericAPIKeySecret } from "../../models/generic-apikey-secret";
import { ParameterValue } from "../../models/parameter-value";
import { Secret, SecretFactory } from "../../models/secret";
import { WindowsSecret } from "../../models/windows-secret";
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
    test(`isQuotedString(""Hello\`"world2"")`, () => {
        //@ts-ignore
        expect(Utils.isQuotedString(`"Hello\`"world2"`)).toEqual(true);
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
    test(`addQuotes("Hello\`"world2")`, () => {
        //@ts-ignore
        expect(Utils.addQuotes(`Hello\`"world2`)).toEqual(`"Hello\`"world2"`);
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
            { key: "First", value: "1st" },
            { key: "Second", value: "2nd" },
            { key: "Third", value: "3rd" }
        ]);
    })
    test(`Number values Enumeration`, () => {
        expect(Utils.getEnum(NumberValuesEnum)).toEqual([
            { key: "Zero", value: 0 },
            { key: "One", value: 1 },
            { key: "Two", value: 2 },
            { key: "Three", value: 3 }
        ]);
    })
})

describe("Utils Class - getFullyQualifiedUserName", () => {

    test(`Missing User name`, () => {
        expect(Utils.getFullyQualifiedUserName("")).toEqual("");
    })
    test(`Username and no domain`, () => {
        expect(Utils.getFullyQualifiedUserName("john.doe")).toEqual("john.doe");
    })
    test(`Domain and no UserName`, () => {
        expect(Utils.getFullyQualifiedUserName("", "MyDOmain")).toEqual("");
    })
    test(`Username and domain`, () => {
        expect(Utils.getFullyQualifiedUserName("john.doe", "MyDomain")).toEqual("MyDomain\\john.doe");
    })
})

describe("Utils Class - PSCredentialFromSecret", () => {

    test(`Missing Secret`, () => {
        expect(() => {
            //@ts-ignore
            Utils.getPSCredentialFromSecret(null);
        }).toThrow(`The supplied secret is a null reference`);
    })
    test(`Missing Secret "value" attribute`, () => {
        expect(() => {
            //@ts-ignore
            Utils.getPSCredentialFromSecret({});
        }).toThrow(`The supplied secret is a null reference`);
    })
    test(`Missing Secret "userName" attribute`, () => {
        expect(() => {
            Utils.getPSCredentialFromSecret(
                //@ts-ignore
                {
                    value: {}
                });
        }).toThrow(`The supplied secret value doesn't have a "userName" property`);
    })
    test(`Passing the right Secret object`, () => {
        let obj = {
            value: {
                userName: "john.doe",
                domain: "mydomain",
                password: "mypassword"
            }
        }
        //@ts-ignore
        expect(Utils.getPSCredentialFromSecret(obj))
            .toEqual(`New-Object System.Management.Automation.PSCredential "${obj.value.domain}\\${obj.value.userName}", (ConvertTo-SecureString "${obj.value.password}" -AsPlainText -Force)`);
    })
})

describe("Utils Class - toPowerShellCustomObject", () => {

    test(`Missing credential`, () => {
        expect(() => {
            //@ts-ignore
            Utils.credentialToPowerShellCustomObject(null);
        }).toThrow(`We expect a valid Credential`);
    })
    test(`Missing Credential type`, () => {
        expect(() => {
            //@ts-ignore
            Utils.credentialToPowerShellCustomObject({
                credentialType: ""
            });
        }).toThrow(`The supplied credential instance doesn't have a valid CredentialType assigned`);
    })
    test(`Missing Secret`, () => {
        let cred: Credential = new Credential();
        cred.credentialType = CredentialTypes.AWS;

        expect(() => {
            Utils.credentialToPowerShellCustomObject(cred,
                //@ts-ignore
                {});
        }).toThrow(`The supplied secret is a null reference`);
    })
    test(`Windows Credential to PSCustomObject`, () => {
        //Credential fields:
        let f1: ParameterValue = new ParameterValue();
        f1.name = "Field1";
        f1.value = "Field1Value"
        let f2: ParameterValue = new ParameterValue();
        f2.name = "Field2";
        f2.value = "Field2Value"
        //Creating the credential:
        let cred: Credential = new Credential();
        cred.name = "TestCred";
        cred.credentialType = CredentialTypes.Windows;
        cred.fields.push(f1);
        cred.fields.push(f2);
        //Creating the Secret:
        let secret = (SecretFactory.createFromCredential(cred) as Secret<WindowsSecret>);
        secret.value.userName = "john.doe";
        secret.value.domain = "mydomain";
        secret.value.password = "mypassword";

        let actual = Utils.credentialToPowerShellCustomObject(cred, secret)
            .replace(/(\r\n|\n|\r)/gm, "") //Removing any break lines
            .replace(/\s+/g, ""); //Removing spaces.
        let expected = (`[pscustomobject]@{
  Name = "TestCred";
  Type = "Windows";
  Fields = [pscustomobject]@{
      Field1 = "Field1Value";
      Field2 = "Field2Value";
  };
  cred = (New-Object System.Management.Automation.PSCredential "mydomain\\john.doe", (ConvertTo-SecureString "mypassword" -AsPlainText -Force));
};`)
            .replace(/(\r\n|\n|\r)/gm, "")
            .replace(/\s+/g, "");

        expect(actual)
            .toEqual(expected);
    })
    test(`Generic API Key Credential to PSCustomObject`, () => {
        //Credential fields:
        let f1: ParameterValue = new ParameterValue();
        f1.name = "Field1";
        f1.value = "Field1Value"
        let f2: ParameterValue = new ParameterValue();
        f2.name = "Field2";
        f2.value = "Field2Value"
        //Creating the credential:
        let cred: Credential = new Credential();
        cred.name = "TestCred";
        cred.credentialType = CredentialTypes.APIKey;
        cred.fields.push(f1);
        cred.fields.push(f2);
        //Creating the Secret:
        let secret = (SecretFactory.createFromCredential(cred) as Secret<GenericAPIKeySecret>);
        secret.value.appId = "myAppId";
        secret.value.apiKey = "secretAPIKey";

        let actual = Utils.credentialToPowerShellCustomObject(cred, secret)
            .replace(/(\r\n|\n|\r)/gm, "") //Removing any break lines
            .replace(/\s+/g, ""); //Removing spaces.
        let expected = (`[pscustomobject]@{
  Name = "TestCred";
  Type = "APIKey";
  Fields = [pscustomobject]@{
      Field1 = "Field1Value";
      Field2 = "Field2Value";
  };
  AppId = "myAppId";
  APIKey = "secretAPIKey";
};`)
            .replace(/(\r\n|\n|\r)/gm, "")
            .replace(/\s+/g, "");

        expect(actual)
            .toEqual(expected);
    })
    test(`Database Credential to PSCustomObject`, () => {
        //Credential fields:
        let f1: ParameterValue = new ParameterValue();
        f1.name = "Field1";
        f1.value = "Field1Value"
        let f2: ParameterValue = new ParameterValue();
        f2.name = "Field2";
        f2.value = "Field2Value"
        //Creating the credential:
        let cred: Credential = new Credential();
        cred.name = "TestCred";
        cred.credentialType = CredentialTypes.Database;
        cred.fields.push(f1);
        cred.fields.push(f2);
        //Creating the Secret:
        let secret = (SecretFactory.createFromCredential(cred) as Secret<DatabaseSecret>);
        secret.value.user = "myUser";
        secret.value.password = "myPassword";
        secret.value.connectionString = "my connection string";

        let actual = Utils.credentialToPowerShellCustomObject(cred, secret)
            .replace(/(\r\n|\n|\r)/gm, "") //Removing any break lines
            .replace(/\s+/g, ""); //Removing spaces.
        let expected = (`[pscustomobject]@{
  Name = "TestCred";
  Type = "Database";
  Fields = [pscustomobject]@{
      Field1 = "Field1Value";
      Field2 = "Field2Value";
  };
  User = "myUser";
  Password = "myPassword";
  ConnectionString = "my connection string";
};`)
            .replace(/(\r\n|\n|\r)/gm, "")
            .replace(/\s+/g, "");

        expect(actual)
            .toEqual(expected);
    })
})

describe("Utils Class - removeTimeFromDate", () => {

    test(`Null value`, () => {
        //@ts-ignore
        expect(Utils.removeTimeFromDate(null)).toBe(null)
    })
    test(`Non Date value`, () => {
        //@ts-ignore
        expect(Utils.removeTimeFromDate({})).toStrictEqual({})
    })
    test(`Date with Time`, () => {
        ;
        expect(Utils.removeTimeFromDate(new Date(2021, 9, 17, 8, 30, 25, 416)))
            .toEqual(new Date(2021, 9, 17, 0, 0, 0, 0))
    })
})

describe("Utils Class - addDays", () => {
    test(`Null value for parameter "date"`, () => {
        //@ts-ignore
        expect(Utils.addDays(null)).toBe(null)
    })
    test(`Null value for parameter "days"`, () => {
        //@ts-ignore
        expect(Utils.addDays(new Date(2021, 9, 17, 8, 30, 25, 416), null)).toEqual(new Date(2021, 9, 17, 8, 30, 25, 416))
    })
    test(`Non Date value for parameter "date"`, () => {
        //@ts-ignore
        expect(Utils.addDays({}, 2)).toStrictEqual({})
    })
    test(`Adding 1 day`, () => {
        expect(Utils.addDays(new Date(2021, 9, 17, 8, 30, 25, 416), 1))
            .toEqual(new Date(2021, 9, 18, 8, 30, 25, 416))
    })
    test(`Subtracting 1 day`, () => {
        expect(Utils.addDays(new Date(2021, 9, 17, 8, 30, 25, 416), -1))
            .toEqual(new Date(2021, 9, 16, 8, 30, 25, 416))
    })
})

describe("Utils Class - getGetOrdinalSuffix", () => {
    test(`Null value for parameter "number"`, () => {
        //@ts-ignore
        expect(Utils.getOrdinalSuffix(null)).toEqual("");
    })
    test(`0	Zero 	0th	Zeroth`, () => {
        expect(Utils.getOrdinalSuffix(1)).toEqual("st");
    })
    test(` 1st – first`, () => {
        expect(Utils.getOrdinalSuffix(1)).toEqual('st');
    })
    test(` 2nd – second`, () => {
        expect(Utils.getOrdinalSuffix(2)).toEqual('nd');
    })
    test(` 3rd – third`, () => {
        expect(Utils.getOrdinalSuffix(3)).toEqual('rd');
    })
    test(` 4th – fourth`, () => {
        expect(Utils.getOrdinalSuffix(4)).toEqual('th');
    })
    test(` 5th – fifth`, () => {
        expect(Utils.getOrdinalSuffix(5)).toEqual('th');
    })
    test(` 6th – sixth`, () => {
        expect(Utils.getOrdinalSuffix(6)).toEqual('th');
    })
    test(` 7th – seventh`, () => {
        expect(Utils.getOrdinalSuffix(7)).toEqual('th');
    })
    test(` 8th – eighth`, () => {
        expect(Utils.getOrdinalSuffix(8)).toEqual('th');
    })
    test(` 9th – ninth`, () => {
        expect(Utils.getOrdinalSuffix(9)).toEqual('th');
    })
    test(`10th – tenth`, () => {
        expect(Utils.getOrdinalSuffix(10)).toEqual('th');
    })
    test(`11th – eleventh`, () => {
        expect(Utils.getOrdinalSuffix(11)).toEqual('th');
    })
    test(`12th – twelfth`, () => {
        expect(Utils.getOrdinalSuffix(12)).toEqual('th');
    })
    test(`13th – thirteenth`, () => {
        expect(Utils.getOrdinalSuffix(13)).toEqual('th');
    })
    test(`14th – fourteenth`, () => {
        expect(Utils.getOrdinalSuffix(14)).toEqual('th');
    })
    test(`15th – fifteenth`, () => {
        expect(Utils.getOrdinalSuffix(15)).toEqual('th');
    })
    test(`16th – sixteenth`, () => {
        expect(Utils.getOrdinalSuffix(16)).toEqual('th');
    })
    test(`17th – seventeenth`, () => {
        expect(Utils.getOrdinalSuffix(17)).toEqual('th');
    })
    test(`18th – eighteenth`, () => {
        expect(Utils.getOrdinalSuffix(18)).toEqual('th');
    })
    test(`19th – nineteenth`, () => {
        expect(Utils.getOrdinalSuffix(19)).toEqual('th');
    })
    test(`20th – twentieth`, () => {
        expect(Utils.getOrdinalSuffix(20)).toEqual('th');
    })
    test(`21st – twenty-first`, () => {
        expect(Utils.getOrdinalSuffix(21)).toEqual('st');
    })
    test(`22nd – twenty-second`, () => {
        expect(Utils.getOrdinalSuffix(22)).toEqual('nd');
    })
    test(`23rd – twenty-third`, () => {
        expect(Utils.getOrdinalSuffix(23)).toEqual('rd');
    })
    test(`24th – twenty-fourth`, () => {
        expect(Utils.getOrdinalSuffix(24)).toEqual('th');
    })
    test(`25th – twenty-fifth`, () => {
        expect(Utils.getOrdinalSuffix(25)).toEqual('th');
    })
    test(`26th – twenty-sixth`, () => {
        expect(Utils.getOrdinalSuffix(26)).toEqual('th');
    })
    test(`27th – twenty-seventh`, () => {
        expect(Utils.getOrdinalSuffix(27)).toEqual('th');
    })
    test(`28th – twenty-eighth`, () => {
        expect(Utils.getOrdinalSuffix(28)).toEqual('th');
    })
    test(`29th – twenty-ninth`, () => {
        expect(Utils.getOrdinalSuffix(29)).toEqual('th');
    })
    test(`30th – thirtieth`, () => {
        expect(Utils.getOrdinalSuffix(30)).toEqual('th');
    })
    test(`31st – thirty-first`, () => {
        expect(Utils.getOrdinalSuffix(31)).toEqual('st');
    })
})

describe("Utils Class - BacktickDoubleQuotesForPowerShell", () => {
    test(`Null value for parameter "value"`, () => {
        //@ts-ignore
        expect(Utils.backtickDoubleQuotes(null)).toBe(null)
    })
    test(`Non String value for parameter "value"`, () => {
        //@ts-ignore
        expect(Utils.backtickDoubleQuotes(23)).toStrictEqual(23)
    })
    test(`String value without double quotes`, () => {
        expect(Utils.backtickDoubleQuotes("This is 'a sample#$% value")).toEqual("This is 'a sample#$% value")
    })
    test(`String value with double quotes Case 1`, () => {
        expect(Utils.backtickDoubleQuotes("This is \"a sample#$% value")).toEqual("This is `\"a sample#$% value")
    })
    test(`String value with double quotes Case 2`, () => {
        expect(Utils.backtickDoubleQuotes("This is \"\"a sample#$% value")).toEqual("This is `\"`\"a sample#$% value")
    })
    test(`String already backticked`, () => {
        expect(Utils.backtickDoubleQuotes("This is `\" an already backticked string `\"")).toEqual("This is `\" an already backticked string `\"")
    })
})

describe("Utils Class - getRandomIntFromInterval", () => {
    test(`Call it with No params`, () => {
        //@ts-ignore
        expect(() => {
            //@ts-ignore
            Utils.getRandomIntFromInterval();
        }).toThrow(`You need to supply both paramters`);
    })
    test(`Call it with No numeric params`, () => {
        //@ts-ignore
        expect(() => {
            //@ts-ignore
            Utils.getRandomIntFromInterval("not a number", { notANumber: "Neither" });
        }).toThrow(`"min" and "max" parameters need to be numbers.`);
    })
    test(`Call it with "max" value less than "min" value`, () => {
        //@ts-ignore
        expect(() => {
            //@ts-ignore
            Utils.getRandomIntFromInterval(10, 3);
        }).toThrow(`Parameter "min" need to be less than "max"`);
    })
    test(`Expect a number between the interval (1,100)`, () => {
        let min: number = 1
        let max: number = 100
        let n: number = Utils.getRandomIntFromInterval(min, max);

        expect(n).not.toBeNaN()
        expect(n).toBeGreaterThanOrEqual(min);
        expect(n).toBeLessThanOrEqual(max);
    })
    test(`Expect min value when min and max are the same value`, () => {
        let min: number = 45
        let max: number = 45
        let n: number = Utils.getRandomIntFromInterval(min, max);

        expect(n).not.toBeNaN()
        expect(n).toEqual(min);
    })
    test(`Expect a number between a negative interval (-34,-100)`, () => {
        let min: number = 1
        let max: number = 100
        let n: number = Utils.getRandomIntFromInterval(min, max);

        expect(n).not.toBeNaN()
        expect(n).toBeGreaterThanOrEqual(min);
        expect(n).toBeLessThanOrEqual(max);
    })
})

describe("Utils Class - getURLPath()", () => {

    test(`Call it with null URL`, () => {
        //@ts-ignore
        let u: string = Utils.getURLPath(null);
        expect(u).toEqual("");
    })

    test(`Call it with empty URL`, () => {
        let u: string = Utils.getURLPath("");
        expect(u).toEqual("");
    })

    test(`Call it with only path name without slashes `, () => {
        let u: string = Utils.getURLPath("my-path");
        expect(u).toEqual("/my-path");
    })

    test(`Call it with only path name with leading slash `, () => {
        let u: string = Utils.getURLPath("/my-path");
        expect(u).toEqual("/my-path");
    })

    test(`Call it with only path name with trail slash `, () => {
        let u: string = Utils.getURLPath("my-path/");
        expect(u).toEqual("/my-path");
    })

    test(`Call it with relative URL with querystring without trailing slash `, () => {
        let u: string = Utils.getURLPath("/first/second?key1=value1");
        expect(u).toEqual("/first/second");
    })

    test(`Call it with relative URL with querystring with trailing slash `, () => {
        let u: string = Utils.getURLPath("/first/second/?key1=value1");
        expect(u).toEqual("/first/second");
    })

    test(`Call it with relative URL with querystring without any slashes `, () => {
        let u: string = Utils.getURLPath("first/second?key1=value1");
        expect(u).toEqual("/first/second");
    })

    test(`Call it with full URL with querystring without trailing slash `, () => {
        let u: string = Utils.getURLPath("http://mysite.com/first/second?key1=value1");
        expect(u).toEqual("/first/second");
    })

    test(`Call it with full URL with querystring with trailing slash `, () => {
        let u: string = Utils.getURLPath("http://mysite.com/first/second/?key1=value1");
        expect(u).toEqual("/first/second");
    })
})

describe("Utils Class - joinURLPath()", () => {

    test(`Call it with null URL`, () => {
        //@ts-ignore
        let u: string = Utils.joinURLPath(null);
        expect(u).toEqual("/");
    })

    test(`Call it with empty URL`, () => {
        //@ts-ignore
        let u: string = Utils.joinURLPath("");
        expect(u).toEqual("/");
    })

    test(`Single path no slashes`, () => {
        let u: string = Utils.joinURLPath("this");
        expect(u).toEqual("/this");
    })

    test(`Multiple path in the same entry`, () => {
        let u: string = Utils.joinURLPath("/this/test/ok");
        expect(u).toEqual("/this/test/ok");
    })

    test(`Multiple path in the same entry with missing or incorrect slashes`, () => {
        let u: string = Utils.joinURLPath("this////test/ok///");
        expect(u).toEqual("/this/test/ok");
    })
    
    test(`Multiple path no slashes`, () => {
        //@ts-ignore
        let u: string = Utils.joinURLPath("this", "is", "a", "longjourney", "for", "all-of-us");
        expect(u).toEqual("/this/is/a/longjourney/for/all-of-us");
    })

    test(`Multiple path with right slashes`, () => {
        //@ts-ignore
        let u: string = Utils.joinURLPath("/this", "/is", "/a", "/longjourney", "/for", "/all-of-us");
        expect(u).toEqual("/this/is/a/longjourney/for/all-of-us");
    })

    test(`Multiple path with duplicated and incorrect slashes`, () => {
        //@ts-ignore
        let u: string = Utils.joinURLPath("/this", "//is", "////a", "long/journey", "/for//", "/all//of//us");
        expect(u).toEqual("/this/is/a/long/journey/for/all/of/us");
    })
})


