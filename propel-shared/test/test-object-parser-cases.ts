import { ParameterValue } from "../models/parameter-value"

export class TestObjectParserCases {

    //#region Refs & Embedds

    static get Code_invalidType(): string {
        return `[InvalidType]@{}`
    }

    static get Code_validTypeEmpty(): string {
        return `@{}`
    }

    static get Code_NotParsingMissingClosePunctuatorParentheses(): string {
        return `@{
    First = 'Next is missing closing punctuator'
    Second = if(2 -eq 2 {
    $var = "var"
    "Es 2 igual a dos"
}
else {
    "No es"
}
    Third = 23kb
}`
    }

    static get Code_NotParsingMissingClosePunctuatorBrace(): string {
        return `@{
    First = 'Next is missing closing punctuator'
    Second = if(2 -eq 2) {
    $var = "var"
    "Es 2 igual a dos"
}
else {
    "No es"
    Third = 23kb
}`
    }

    static get Code_NotParsingMissingOpenPunctuatorHereString(): string {
        return `@{
    First = 'Next is missing closing punctuator'
    Second = 
This is a here string 
without opening
@'
    Third = 23kb
}`
    }

    static get Code_NotParsingMissingClosePunctuatorHereString(): string {
        return `@{
    First = 'Next is missing closing punctuator'
    Second = @'
This is a here string 
without closing
    Third = 23kb
}`
    }

    static get Code_NotParsingMissingOpenPunctuatorAtPlusBrace(): string {
        return `@{
    First = 'Next is missing opening punctuator'
    Second = 
        Other = "Other value"
    }
    Third = 23kb
}`
    }

    static get Code_NotParsingMissingClosePunctuatorString(): string {
        return `     @{
            "First" = "String remain unclosed
            _Second = @(1,2,3)
        }`
    }

    static get Code_validTypeHashTable(): string {
        return `[HashTable]@{}`
    }

    static get Code_validTypeHashTablePartial(): string {
        return `[Collections.HashTable}@{}`
    }

    static get Code_validTypeHashTableFullName(): string {
        return `[System.Collections.Hashtable]@{}`
    }

    static get Code_validTypeObjectPartial(): string {
        return `[Object]@{}`
    }

    static get Code_validTypeObjectFullName(): string {
        return `[System.Object]@{}`
    }

    static get Code_validTypePSCustomObject(): string {
        return `[PSCustomObject]@{}`
    }

    static get validTypePSCustomObjectPartial(): string {
        return `[Management.Automation.PSCustomObject]@{}`
    }

    static get Code_validTypePSCustomObjectFullName(): string {
        return `[System.Management.Automation.PSCustomObject]@{}`
    }

    static get Code_invalidFormatOpenerPunctuator(): string {
        return `[PSCustomObject]@(
            }`
    }

    static get Code_invalidFormatTerminatorPunctuator(): string {
        return `[PSCustomObject]@{
            )`
    }

    static get Code_invalidFormatMissingEqualitySign(): string {
        return `     @{
            "First" "String remain unclosed"
            _Second @(1,2,3)
        }`
    }

    static get Code_invalidFormatMissingEqualitySignExtraKey(): string {
        return `     @{
            "First" = "String remain unclosed"
            _Second @(1,2,3)
        }`
    }

    static get Code_Untyped_SingleItem_Breaklines(): string {
        return `@{
                First = 'First Item as string'
            }`
    }

    static get Code_Untyped_SingleItem_Semicolon(): string {
        return `@{ First = 'First Item as string'; }`
    }

    static get Code_Typed_OneItem_Breaklines(): string {
        return `[pscustomobject]  @{
            "First Numeric" = 12345.67
        }`
    }

    static get Code_Untyped_TwoItems_Breaklines(): string {
        return `     @{
            "First Boolean" = $true
            _Second = "String with
            Breakline"
        }`
    }

    static get Code_Untyped_TwoItems_Semicolons(): string {
        return `    @{"First Boolean" = $true; _Second = "String with
            Breakline";}`
    }

    static get Code_ComplexCase_Breaklines(): string {
        return `[pscustomobject]  @{_First = (Get-Date)
    Second = "\`a"\r\n'Third' = $wer
    Fourth = [int]1
    "Fifth" = -234.45
    Sixth = if(2 -eq 2) {
    $var = "var"
    "Es 2 igual a dos"
}
else {
    "No es"
}
    Seventh = "Last 
Value"
    "Eighth" = @"
This= is a here string.
"@
    "Nineth" = @(1,
2,
3)
    Tenth = [pscustomobject]@{
        Tenth_1 = 12
        Tenth_2 = @{
            "aqua" = "Water"; Ext = "Other"
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
}
}`
    }

    static get Code_ComplexCase_Semicolons(): string {
        return `[pscustomobject]  @{_First = (Get-Date); Second = "\`a"; 'Third' = $wer;` +
            `Fourth = [int]1; "Fifth" = -234.45; Sixth = if(2 -eq 2) {$var = "var"; ` +
            `"Es 2 igual a dos"} else {"No es"}; Seventh = "Last\nValue"; ` +
            `"Eighth" = [pscustomobject]@{Tenth_1 = 12;Tenth_2 = @{"aqua" = "Water"; Ext = "Other"}}}`
    }

    static get Values_Empty(): ParameterValue[] {
        return []
    }

    static get Values_3Items(): ParameterValue[] {
        return [
            {
                name: "First",
                value: "String value",
                nativeType: "System.String",
                isRuntimeParameter: false
            },
            {
                name: "Second item",
                value: "$null",
                nativeType: "System.Object",
                isRuntimeParameter: false
            },
            {
                name: "Third an last item",
                value: "0x34b6d6",
                nativeType: "System.Decimal",
                isRuntimeParameter: false
            }
        ]
    }

    static get Values_ComplexCase(): ParameterValue[] {
        return [
            {
                name: "_First",
                value: "(Get-Date)",
                nativeType: "System.Object",
                isRuntimeParameter: false
            },
            {
                name: "Second",
                value: "`a",
                nativeType: "System.String",
                isRuntimeParameter: false
            },
            {
                name: "Third",
                value: "$wer",
                nativeType: "System.Object",
                isRuntimeParameter: false
            },
            {
                name: "Fourth",
                value: "[int]1",
                nativeType: "System.Object",
                isRuntimeParameter: false
            },
            {
                name: "Fifth",
                value: "-234.45",
                nativeType: "System.Decimal",
                isRuntimeParameter: false
            },
            {
                name: "Sixth",
                value: "if(2 -eq 2) {\n$var = \"var\"\n\"Es 2 igual a dos\"\n}\nelse {\n\"No es\"\n}",
                nativeType: "System.Object",
                isRuntimeParameter: false
            },
            {
                name: "Seventh",
                value: "Last\nValue",
                nativeType: "System.String",
                isRuntimeParameter: false
            },
            {
                name: "Eighth",
                value: "@\"\nThis= is a here string.\n\"@",
                nativeType: "System.Object",
                isRuntimeParameter: false
            },
            {
                name: "Nineth",
                value: "@(1,\n2,\n3)",
                nativeType: "System.Object",
                isRuntimeParameter: false
            },
            {
                name: "Tenth",
                value: "[pscustomobject]@{\nTenth_1 = 12\nTenth_2 = @{\n\"aqua\" = \"Water\"\nExt = \"Other\"\nNoxtro = @\"\nNow a here string\nwith 2 lines.\n\"@\nCond = if(3 -eq 3) {\n$var3 = \"var3\"\n\"Is 3!!\"\n}\nelse {\n\"No es\"\n}\n}\n}",
                nativeType: "System.Object",
                isRuntimeParameter: false
            }
        ]
    }


}