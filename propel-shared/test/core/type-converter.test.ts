import { TypeConverter } from "../../core/type-converter";
import { JSType, PSType } from "../../core/type-definitions";

describe("TypeConverter Class - Invalid Parameters", () => {
    test(`Null value`, () => {
        expect(() => {
            //@ts-ignore
            TypeConverter.fromPowerShellType(null)
        }).toThrow(`The specified PowerShell type is not supported by this API`);
    })
    test(`Not a valid Powershell type`, () => {
        expect(() => {
            TypeConverter.fromPowerShellType("unknown type")
        }).toThrow(`The specified PowerShell type is not supported by this API`);
    })
})

describe("TypeConverter Class - Valid Parameters", () => {
    test(`Object type conversion`, () => {
        expect(TypeConverter.fromPowerShellType(PSType.Object)).toEqual(JSType.Object);
    })
    test(`XML type conversion`, () => {
        expect(TypeConverter.fromPowerShellType(PSType.XML)).toEqual(JSType.Object);
    })
    test(`HashTable type conversion`, () => {
        expect(TypeConverter.fromPowerShellType(PSType.Hashtable)).toEqual(JSType.Object);
    })
    test(`String type conversion`, () => {
        expect(TypeConverter.fromPowerShellType(PSType.String)).toEqual(JSType.String);
    })
    test(`Char type conversion`, () => {
        expect(TypeConverter.fromPowerShellType(PSType.Char)).toEqual(JSType.String);
    })
    test(`Byte type conversion`, () => {
        expect(TypeConverter.fromPowerShellType(PSType.Byte)).toEqual(JSType.Number);
    })
    test(`Int32 type conversion`, () => {
        expect(TypeConverter.fromPowerShellType(PSType.Int32)).toEqual(JSType.Number);
    })
    test(`Int64 type conversion`, () => {
        expect(TypeConverter.fromPowerShellType(PSType.Int64)).toEqual(JSType.Number);
    })
    test(`Decimal type conversion`, () => {
        expect(TypeConverter.fromPowerShellType(PSType.Decimal)).toEqual(JSType.Number);
    })
    test(`Single type conversion`, () => {
        expect(TypeConverter.fromPowerShellType(PSType.Single)).toEqual(JSType.Number);
    })
    test(`Double type conversion`, () => {
        expect(TypeConverter.fromPowerShellType(PSType.Double)).toEqual(JSType.Number);
    })
    test(`Boolean type conversion`, () => {
        expect(TypeConverter.fromPowerShellType(PSType.Boolean)).toEqual(JSType.Boolean);
    })
    test(`Switch type conversion`, () => {
        expect(TypeConverter.fromPowerShellType(PSType.Switch)).toEqual(JSType.Boolean);
    })
    test(`Datetime type conversion`, () => {
        expect(TypeConverter.fromPowerShellType(PSType.DateTime)).toEqual(JSType.Date);
    })
    test(`StringArray type conversion`, () => {
        expect(TypeConverter.fromPowerShellType(PSType.StringArray)).toEqual(JSType.Array);
    })
    test(`Int32Array type conversion`, () => {
        expect(TypeConverter.fromPowerShellType(PSType.Int32Array)).toEqual(JSType.Array);
    })
    test(`Array type conversion`, () => {
        expect(TypeConverter.fromPowerShellType(PSType.Array)).toEqual(JSType.Array);
    })
    test(`PSCustomObject type conversion`, () => {
        expect(TypeConverter.fromPowerShellType(PSType.PSCustomObject)).toEqual(JSType.Object);
    })
})