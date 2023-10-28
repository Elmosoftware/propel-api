import { ObjectParser } from "../../core/object-parser";
import { PSType } from "../../core/type-definitions";
import { TestObjectParserCases } from "../test-object-parser-cases";

describe("ObjectParser Class - fromString()", () => {

  let parser: ObjectParser;

  beforeEach(() => {
    parser = new ObjectParser()
  })

  test(`Invalid Type`, () => {
    expect(() => {
      parser.fromString(TestObjectParserCases.Code_invalidType)
    }).toThrow(`The specified type "InvalidType" is not allowed`);
  })

  test(`Empty code`, () => {
    parser.fromString("")

    expect(parser.type).toEqual(PSType.Hashtable)
    expect(parser.values.length).toEqual(0)
  })

  test(`Not Parsing - Missing Close punctuator ")"`, () => {
    expect(() => {
      parser.fromString(TestObjectParserCases.Code_NotParsingMissingClosePunctuatorParentheses)
    }).toThrow(`Parsing error`);
  })

  test(`Not Parsing - Missing Close punctuator "}"`, () => {
    expect(() => {
      parser.fromString(TestObjectParserCases.Code_NotParsingMissingClosePunctuatorBrace)
    }).toThrow(`Parsing error`);
  })

  test(`Not Parsing - Missing Open punctuator "@{"`, () => {
    expect(() => {
      parser.fromString(TestObjectParserCases.Code_NotParsingMissingOpenPunctuatorAtPlusBrace)
    }).toThrow(`Parsing error`);
  })

  test(`Not Parsing - Missing Open punctuator "@'"`, () => {
    expect(() => {
      parser.fromString(TestObjectParserCases.Code_NotParsingMissingOpenPunctuatorHereString)
    }).toThrow(`Parsing error`);
  })

  test(`Not Parsing - Missing Close punctuator "'@"`, () => {
    expect(() => {
      parser.fromString(TestObjectParserCases.Code_NotParsingMissingClosePunctuatorHereString)
    }).toThrow(`Parsing error`);
  })

  test(`Not Parsing - Missing Close String punctuator "'"`, () => {
    expect(() => {
      parser.fromString(TestObjectParserCases.Code_NotParsingMissingClosePunctuatorString)
    }).toThrow(`Parsing error`);
  })

  test(`Valid type - No type`, () => {
    parser.fromString(TestObjectParserCases.Code_validTypeEmpty)

    expect(parser.type).toEqual(PSType.Hashtable)
  })

  test(`Valid type - HashTable`, () => {
    parser.fromString(TestObjectParserCases.Code_validTypeHashTable)

    expect(parser.type).toEqual(PSType.Hashtable)
  })

  test(`Valid type - HashTable partial name`, () => {
    parser.fromString(TestObjectParserCases.Code_validTypeHashTablePartial)

    expect(parser.type).toEqual(PSType.Hashtable)
  })

  test(`Valid type - HashTable full name`, () => {
    parser.fromString(TestObjectParserCases.Code_validTypeHashTableFullName)

    expect(parser.type).toEqual(PSType.Hashtable)
  })

  test(`Valid type - Object partial name`, () => {
    parser.fromString(TestObjectParserCases.Code_validTypeObjectPartial)

    expect(parser.type).toEqual(PSType.Object)
  })

  test(`Valid type - Object full name`, () => {
    parser.fromString(TestObjectParserCases.Code_validTypeObjectFullName)

    expect(parser.type).toEqual(PSType.Object)
  })

  test(`Valid type - PSCustomObject`, () => {
    parser.fromString(TestObjectParserCases.Code_validTypePSCustomObject)

    expect(parser.type).toEqual(PSType.PSCustomObject)
  })

  test(`Valid type - PSCustomObject partial name`, () => {
    parser.fromString(TestObjectParserCases.validTypePSCustomObjectPartial)

    expect(parser.type).toEqual(PSType.PSCustomObject)
  })

  test(`Valid type - PSCustomObject full name`, () => {
    parser.fromString(TestObjectParserCases.Code_validTypePSCustomObjectFullName)

    expect(parser.type).toEqual(PSType.PSCustomObject)
  })

  test(`Invalid format - Initial punctuator invalid`, () => {
    parser.fromString(TestObjectParserCases.Code_invalidFormatOpenerPunctuator)

    expect(parser.values.length).toEqual(0)
  })

  test(`Invalid format - Final punctuator invalid`, () => {
    parser.fromString(TestObjectParserCases.Code_invalidFormatTerminatorPunctuator)

    expect(parser.values.length).toEqual(0)
  })

  test(`Invalid format - Missing equality sign`, () => {
    parser.fromString(TestObjectParserCases.Code_invalidFormatMissingEqualitySign)

    expect(parser.values.length).toEqual(0)
  })

  test(`Invalid format - Missing equality sign for 2nd key`, () => {
    parser.fromString(TestObjectParserCases.Code_invalidFormatMissingEqualitySignExtraKey)
    //Not quite well done, but ....
    expect(parser.values.length).toEqual(1)
  })

  test(`Infered Hashtable - Single String item - Using Breaklines as separator`, () => {
    parser.fromString(TestObjectParserCases.Code_Untyped_SingleItem_Breaklines)

    expect(parser.type).toEqual(PSType.Hashtable)
    expect(parser.values.length).toEqual(1)
    expect(parser.values[0].name).toEqual("First")
    expect(parser.values[0].nativeType).toEqual(PSType.String)
    expect(parser.values[0].value).toEqual("First Item as string")
  })

  test(`Infered Hashtable - Single String item - Using Semicolons as separator`, () => {
    parser.fromString(TestObjectParserCases.Code_Untyped_SingleItem_Semicolon)

    expect(parser.type).toEqual(PSType.Hashtable)
    expect(parser.values.length).toEqual(1)
    expect(parser.values[0].name).toEqual("First")
    expect(parser.values[0].nativeType).toEqual(PSType.String)
    expect(parser.values[0].value).toEqual("First Item as string")
  })

  test(`PSCustomObject - Single Numeric key - Using Breaklines as separator`, () => {
    parser.fromString(TestObjectParserCases.Code_Typed_OneItem_Breaklines)

    expect(parser.type).toEqual(PSType.PSCustomObject)
    expect(parser.values.length).toEqual(1)
    expect(parser.values[0].name).toEqual("First Numeric")
    expect(parser.values[0].nativeType).toEqual(PSType.Decimal)
    expect(parser.values[0].value).toEqual("12345.67")
  })

  test(`HashTable - Two keys: Boolean, Multiline string - Using Breaklines as separator`, () => {
    parser.fromString(TestObjectParserCases.Code_Untyped_TwoItems_Breaklines)

    expect(parser.type).toEqual(PSType.Hashtable)
    expect(parser.values.length).toEqual(2)
    expect(parser.values[0].name).toEqual("First Boolean")
    expect(parser.values[0].nativeType).toEqual(PSType.Object)
    expect(parser.values[0].value).toEqual("$true")
    expect(parser.values[1].name).toEqual("_Second")
    expect(parser.values[1].nativeType).toEqual(PSType.String)
    expect(parser.values[1].value).toEqual("String with\nBreakline")
  })

  test(`HashTable - Two keys: Boolean, Multiline string - Using Semicolons as separator`, () => {
    parser.fromString(TestObjectParserCases.Code_Untyped_TwoItems_Semicolons)

    expect(parser.type).toEqual(PSType.Hashtable)
    expect(parser.values.length).toEqual(2)
    expect(parser.values[0].name).toEqual("First Boolean")
    expect(parser.values[0].nativeType).toEqual(PSType.Object)
    expect(parser.values[0].value).toEqual("$true")
    expect(parser.values[1].name).toEqual("_Second")
    expect(parser.values[1].nativeType).toEqual(PSType.String)
    expect(parser.values[1].value).toEqual("String with\nBreakline")
  })

  test(`PsCustomObject - Valid Multiple keys, Complex case with Breaklines`, () => {
    parser.fromString(TestObjectParserCases.Code_ComplexCase_Breaklines)

    expect(parser.type).toEqual(PSType.PSCustomObject)
    expect(parser.values.length).toEqual(10)
    //1st Parameter:
    expect(parser.values[0].name).toEqual("_First")
    expect(parser.values[0].nativeType).toEqual(PSType.Object)
    expect(parser.values[0].value).toEqual("(Get-Date)")
    //2nd Parameter:
    expect(parser.values[1].name).toEqual("Second")
    expect(parser.values[1].nativeType).toEqual(PSType.String)
    expect(parser.values[1].value).toEqual("`a")
    //3rd Parameter:
    expect(parser.values[2].name).toEqual("Third")
    expect(parser.values[2].nativeType).toEqual(PSType.Object)
    expect(parser.values[2].value).toEqual("$wer")
    //4th Parameter:
    expect(parser.values[3].name).toEqual("Fourth")
    expect(parser.values[3].nativeType).toEqual(PSType.Object)
    expect(parser.values[3].value).toEqual("[int]1")
    //5th Parameter:
    expect(parser.values[4].name).toEqual("Fifth")
    expect(parser.values[4].nativeType).toEqual(PSType.Decimal)
    expect(parser.values[4].value).toEqual("-234.45")
    //6th Parameter:
    expect(parser.values[5].name).toEqual("Sixth")
    expect(parser.values[5].nativeType).toEqual(PSType.Object)
    expect(parser.values[5].value).toEqual(`if(2 -eq 2) {\n$var = "var"\n"Es 2 igual a dos"\n}\nelse {\n"No es"\n}`)
    //7th Parameter:
    expect(parser.values[6].name).toEqual("Seventh")
    expect(parser.values[6].nativeType).toEqual(PSType.String)
    expect(parser.values[6].value).toEqual("Last\nValue")
    //8th Parameter:
    expect(parser.values[7].name).toEqual("Eighth")
    expect(parser.values[7].nativeType).toEqual(PSType.Object)
    expect(parser.values[7].value).toEqual("@\"\nThis= is a here string.\n\"@")
    //9th Parameter:
    expect(parser.values[8].name).toEqual("Nineth")
    expect(parser.values[8].nativeType).toEqual(PSType.Object)
    expect(parser.values[8].value).toEqual("@(1,\n2,\n3)")
    //10th Parameter:
    expect(parser.values[9].name).toEqual("Tenth")
    expect(parser.values[9].nativeType).toEqual(PSType.Object)
    expect(parser.values[9].value).toEqual(`[pscustomobject]@{\nTenth_1 = 12\nTenth_2 = @{\n"aqua" = "Water"\nExt = "Other"\nNoxtro = @"\nNow a here string\nwith 2 lines.\n"@\nCond = if(3 -eq 3) {\n$var3 = "var3"\n"Is 3!!"\n}\nelse {\n"No es"\n}\n}\n}`)
  })

  test(`PsCustomObject - Valid Multiple keys, Complex case with Semicolons`, () => {
    parser.fromString(TestObjectParserCases.Code_ComplexCase_Semicolons)

    expect(parser.type).toEqual(PSType.PSCustomObject)
    expect(parser.values.length).toEqual(8)
    //1st Parameter:
    expect(parser.values[0].name).toEqual("_First")
    expect(parser.values[0].nativeType).toEqual(PSType.Object)
    expect(parser.values[0].value).toEqual("(Get-Date)")
    //2nd Parameter:
    expect(parser.values[1].name).toEqual("Second")
    expect(parser.values[1].nativeType).toEqual(PSType.String)
    expect(parser.values[1].value).toEqual("`a")
    //3rd Parameter:
    expect(parser.values[2].name).toEqual("Third")
    expect(parser.values[2].nativeType).toEqual(PSType.Object)
    expect(parser.values[2].value).toEqual("$wer")
    //4th Parameter:
    expect(parser.values[3].name).toEqual("Fourth")
    expect(parser.values[3].nativeType).toEqual(PSType.Object)
    expect(parser.values[3].value).toEqual("[int]1")
    //5th Parameter:
    expect(parser.values[4].name).toEqual("Fifth")
    expect(parser.values[4].nativeType).toEqual(PSType.Decimal)
    expect(parser.values[4].value).toEqual("-234.45")
    //6th Parameter:
    expect(parser.values[5].name).toEqual("Sixth")
    expect(parser.values[5].nativeType).toEqual(PSType.Object)
    expect(parser.values[5].value).toEqual(`if(2 -eq 2) {$var = "var"\n"Es 2 igual a dos"} else {"No es"}`)
    //7th Parameter:
    expect(parser.values[6].name).toEqual("Seventh")
    expect(parser.values[6].nativeType).toEqual(PSType.String)
    expect(parser.values[6].value).toEqual("Last\nValue")
    //8th Parameter:
    expect(parser.values[7].name).toEqual("Eighth")
    expect(parser.values[7].nativeType).toEqual(PSType.Object)
    expect(parser.values[7].value).toEqual(`[pscustomobject]@{Tenth_1 = 12\nTenth_2 = @{"aqua" = "Water"\nExt = "Other"}}`)
  })

})

describe("ObjectParser Class - fromValues()", () => {

  let parser: ObjectParser;

  beforeEach(() => {
    parser = new ObjectParser()
  })

  test(`Invalid Type`, () => {
    expect(() => {
      //@ts-ignore
      parser.fromValues(TestObjectParserCases.Values_Empty, "unknowntype")
    }).toThrow(`The specified type "unknowntype" is not allowed`);
  })

  test(`Invalid or Empty values`, () => {
    parser.fromValues(TestObjectParserCases.Values_Empty)
    expect(parser.type).toEqual(PSType.Hashtable)
    expect(parser.code).toEqual(`@{}`)
  })

  test(`Hashtable Valid type and values with 3 keys`, () => {
    parser.fromValues(TestObjectParserCases.Values_3Items)
    expect(parser.type).toEqual(PSType.Hashtable)
    expect(parser.code).toEqual(`@{"First"="String value"; "Second item"=$null; "Third an last item"=0x34b6d6}`)
  })

  test(`PSCustomObject Valid type and values with 3 keys`, () => {
    parser.fromValues(TestObjectParserCases.Values_3Items, PSType.PSCustomObject)
    expect(parser.type).toEqual(PSType.PSCustomObject)
    expect(parser.code).toEqual(`[${PSType.PSCustomObject}]@{"First"="String value"; "Second item"=$null; "Third an last item"=0x34b6d6}`)
  })

  test(`Complex case`, () => {
    parser.fromValues(TestObjectParserCases.Values_ComplexCase)
    expect(parser.type).toEqual(PSType.Hashtable)
    expect(parser.code).toEqual(`@{"_First"=(Get-Date); "Second"="\`a"; "Third"=$wer; "Fourth"=[int]1; "Fifth"=-234.45; "Sixth"=if(2 -eq 2) {
$var = "var"
"Es 2 igual a dos"
}
else {
"No es"
}; "Seventh"="Last
Value"; "Eighth"=@"
This= is a here string.
"@; "Nineth"=@(1,
2,
3); "Tenth"=[pscustomobject]@{
Tenth_1 = 12
Tenth_2 = @{
"aqua" = "Water"
Ext = "Other"
Noxtro = @"
Now a here string
with 2 lines.
"@
Cond = if(3 -eq 3) {
$var3 = "var3"
"Is 3!!"
}
else {
"No es"
}
}
}}`)
  })
})