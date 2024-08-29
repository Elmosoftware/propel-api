import { pool } from "../../services/powershell-service-pool";
import { ParamInferenceService } from "../../services/param-inference-service";
import { ScriptParameter } from "../../../propel-shared/models/script-parameter";
import { LogLevel } from "../../core/config";
import { JSType, PSType } from "../../../propel-shared/core/type-definitions";

let testScripts = {
    EmptyScript:
        ``,
    NoParams:
        `return [pscustomobject]@{ ScriptDesc = "NoParams"} | ConvertTo-Json -Compress
`,
    SingleOptionalUntypedParam:
        `param (
    $top
)
    return [pscustomobject]@{ ScriptDesc = "SingleOptionalUntypedParam"} | ConvertTo-Json -Compress
`,
    SingleRequiredUntypedParam:
        `param (
    [Parameter(Mandatory = $true)]
    $top
)
        return [pscustomobject]@{ ScriptDesc = "SingleOptionalUntypedParam"} | ConvertTo-Json -Compress
`,
    SingleRequiredNotNullUntypedParam:
        `param (
[Parameter(Mandatory = $true)]
[ValidateNotNull()]
$top
)
    return [pscustomobject]@{ ScriptDesc = "SingleOptionalUntypedParam"} | ConvertTo-Json -Compress
`,
    SingleRequiredNotNullOrEmptyUntypedParam:
        `param (
[Parameter(Mandatory = $true)]
[ValidateNotNullOrEmpty()]
$top
)
    return [pscustomobject]@{ ScriptDesc = "SingleOptionalUntypedParam"} | ConvertTo-Json -Compress
`,
    SingleWithValidSetUntypedParam:
        `param (
[ValidateSet('ValidValue1','ValidValue2')]
$top
)
    return [pscustomobject]@{ ScriptDesc = "SingleOptionalUntypedParam"} | ConvertTo-Json -Compress
`,
    SingleWithHelpMessageUntypedParam:
        `param (
[Parameter(HelpMessage='Sample help message.')]
$top
)
return [pscustomobject]@{ ScriptDesc = "SingleOptionalUntypedParam"} | ConvertTo-Json -Compress
`,
    Combo:
        `param(
    [Parameter(Mandatory,ValueFromPipelineByPropertyName)]
    [ValidateSet('ValidValue1','ValidValue2')]
    [string]$TestParam1StringWithValidSet,
    
    [Parameter(ValueFromPipeline)]
    [ValidateNotNull()]
    [hashtable]$TestParam2HashNotNullOrEmpty,

    [Parameter(Mandatory=$true)]
    [ValidateNotNullOrEmpty()]
    [int]$TestParam3IntMandatory,

    [double]$TestParam4DoubleWithThrow = $(throw "-TestParam3 is required."),

    [switch]$TestParam5SwitchWithNoDataType = $false,

    $TestParam6JustParamName,

    [Parameter(Mandatory=$true, HelpMessage='This is the TestParam7 with a help message.')]
    [ValidateScript({
                Test-Path -Path $_ -PathType Container
            }
    )]
    [string]$TestParam7StringWithValidateScriptAndHelpMessage,

    [Parameter(HelpMessage='This is the TestParam8 with a help message.')]
    [DateTime]$TestParam8DateTimeWithHelpMessage,

    [Parameter(HelpMessage='This is the TestParam9 with a help message.')]
    [ValidateLength(2,10)]
    [string]$TestParam9WIthValidateLength = "Default",

    [Parameter(HelpMessage='This is the TestParam10 with a help message.')]
    [ValidateRange(0,10)]
    [int]$TestParam10WIthValidateRange = 5,

    [Parameter(HelpMessage='This is the TestParam11 with default.')]
    [array]$TestParam11WIthArray = @("One", "Two")
)
return [pscustomobject]@{ ScriptDesc = "SingleOptionalUntypedParam"} | ConvertTo-Json -Compress
`
}

let infer: ParamInferenceService;

afterAll(() => {
    pool.disposeAnForget();
    pool.reset();
})

describe("InferenceService Class - infer()", () => {

    beforeEach(() => {
        process.env.LOGGING_LEVEL = LogLevel.Error //Setting the logging level to "Error"
        //to void having a flood of logging messages during the test.
        //You can comment the line if you wouldlike to see extra details.
        process.env.POOL_STATS = "off" //This is to prevent to log pool stats in the DB (private 
        //method _handleObjectPoolEvent in the PowerSHellServicePool), which is going to cause errors 
        //and is difficult to mock.

        infer = new ParamInferenceService();
    })

    test(`Script type: Empty script (no code at all)"`, (done) => {
        infer.infer(testScripts.EmptyScript)
            .then((params: ScriptParameter[]) => {
                expect(params.length).toEqual(0);
                done();
            })
    }, 15000)
    test(`Script type: No Params"`, (done) => {
        infer.infer(testScripts.NoParams)
            .then((params: ScriptParameter[]) => {
                expect(params.length).toEqual(0);
                done();
            })
    }, 15000)
    test(`Script type: Single parameter, Optional, Untyped"`, (done) => {
        infer.infer(testScripts.SingleOptionalUntypedParam)
            .then((params: ScriptParameter[]) => {
                expect(params.length).toEqual(1);

                //Parameter #1: top:
                expect(params[0].position).toEqual(0);
                expect(params[0].name).toEqual("top");
                expect(params[0].description).toEqual("");
                expect(params[0].type).toEqual("System.Object");
                expect(params[0].nativeType).toEqual("Object");
                expect(params[0].required).toEqual(false);
                expect(params[0].validValues.length).toEqual(0);
                expect(params[0].canBeNull).toEqual(true);
                expect(params[0].canBeEmpty).toEqual(true);

                done();
            })
    }, 15000)
    test(`Script type: Single parameter, Required, Untyped"`, (done) => {
        infer.infer(testScripts.SingleRequiredUntypedParam)
            .then((params: ScriptParameter[]) => {
                expect(params.length).toEqual(1);

                //Parameter #1: top:
                expect(params[0].position).toEqual(0);
                expect(params[0].name).toEqual("top");
                expect(params[0].description).toEqual("");
                expect(params[0].type).toEqual("System.Object");
                expect(params[0].nativeType).toEqual("Object");
                expect(params[0].required).toEqual(true);
                expect(params[0].validValues.length).toEqual(0);
                expect(params[0].canBeNull).toEqual(true);
                expect(params[0].canBeEmpty).toEqual(true);

                done();
            })
    }, 15000)
    test(`Script type: Single parameter, Required, Not Null, Untyped"`, (done) => {
        infer.infer(testScripts.SingleRequiredNotNullUntypedParam)
            .then((params: ScriptParameter[]) => {
                expect(params.length).toEqual(1);

                //Parameter #1: top:
                expect(params[0].position).toEqual(0);
                expect(params[0].name).toEqual("top");
                expect(params[0].description).toEqual("");
                expect(params[0].type).toEqual("System.Object");
                expect(params[0].nativeType).toEqual("Object");
                expect(params[0].required).toEqual(true);
                expect(params[0].validValues.length).toEqual(0);
                expect(params[0].canBeNull).toEqual(false);
                expect(params[0].canBeEmpty).toEqual(true);

                done();
            })
    }, 15000)
    test(`Script type: Single parameter, Required, Not Null or Empty, Untyped"`, (done) => {
        infer.infer(testScripts.SingleRequiredNotNullOrEmptyUntypedParam)
            .then((params: ScriptParameter[]) => {
                expect(params.length).toEqual(1);

                //Parameter #1: top:
                expect(params[0].position).toEqual(0);
                expect(params[0].name).toEqual("top");
                expect(params[0].description).toEqual("");
                expect(params[0].type).toEqual("System.Object");
                expect(params[0].nativeType).toEqual("Object");
                expect(params[0].required).toEqual(true);
                expect(params[0].validValues.length).toEqual(0);
                expect(params[0].canBeNull).toEqual(false);
                expect(params[0].canBeEmpty).toEqual(false);

                done();
            })
    }, 15000)
    test(`Script type: Single parameter, With Valid set, Untyped"`, (done) => {
        infer.infer(testScripts.SingleWithValidSetUntypedParam)
            .then((params: ScriptParameter[]) => {
                expect(params.length).toEqual(1);

                //Parameter #1: top:
                expect(params[0].position).toEqual(0);
                expect(params[0].name).toEqual("top");
                expect(params[0].description).toEqual("");
                expect(params[0].type).toEqual("System.Object");
                expect(params[0].nativeType).toEqual("Object");
                expect(params[0].required).toEqual(false);
                expect(params[0].validValues.length).toEqual(2);
                expect(params[0].validValues[0]).toEqual("ValidValue1");
                expect(params[0].validValues[1]).toEqual("ValidValue2");
                expect(params[0].canBeNull).toEqual(true);
                expect(params[0].canBeEmpty).toEqual(true);

                done();
            })
    }, 15000)
    test(`Script type: Single parameter, With Help message, Untyped"`, (done) => {
        infer.infer(testScripts.SingleWithHelpMessageUntypedParam)
            .then((params: ScriptParameter[]) => {
                expect(params.length).toEqual(1);

                //Parameter #1: top:
                expect(params[0].position).toEqual(0);
                expect(params[0].name).toEqual("top");
                expect(params[0].description).toEqual("Sample help message.");
                expect(params[0].type).toEqual("System.Object");
                expect(params[0].nativeType).toEqual("Object");
                expect(params[0].required).toEqual(false);
                expect(params[0].validValues.length).toEqual(0);
                expect(params[0].canBeNull).toEqual(true);
                expect(params[0].canBeEmpty).toEqual(true);

                done();
            })
    }, 15000)
    test(`Script type: Combo"`, (done) => {
        
            infer.infer(testScripts.Combo)
            .then((params: ScriptParameter[]) => {
                expect(params.length).toEqual(11);

                //Parameter #1: TestParam1StringWithValidSet:
                expect(params[0].position).toEqual(0);
                expect(params[0].name).toEqual("TestParam1StringWithValidSet");
                expect(params[0].description).toEqual("");
                expect(params[0].type).toEqual(PSType.String);
                expect(params[0].nativeType).toEqual(JSType.String);
                expect(params[0].required).toEqual(true);
                expect(params[0].validValues.length).toEqual(2);
                expect(params[0].canBeNull).toEqual(true);
                expect(params[0].canBeEmpty).toEqual(true);
                expect(params[0].defaultValue).toEqual("");


                //Parameter #2: TestParam2HashNotNullOrEmpty:
                expect(params[1].position).toEqual(1);
                expect(params[1].name).toEqual("TestParam2HashNotNullOrEmpty");
                expect(params[1].description).toEqual("");
                expect(params[1].type).toEqual(PSType.Hashtable);
                expect(params[1].nativeType).toEqual(JSType.Object);
                expect(params[1].required).toEqual(false);
                expect(params[1].validValues.length).toEqual(0);
                expect(params[1].canBeNull).toEqual(false);
                expect(params[1].canBeEmpty).toEqual(true);
                expect(params[1].defaultValue).toEqual("");

                //Parameter #3: TestParam3IntMandatory:
                expect(params[2].position).toEqual(2);
                expect(params[2].name).toEqual("TestParam3IntMandatory");
                expect(params[2].description).toEqual("");
                expect(params[2].type).toEqual(PSType.Int32);
                expect(params[2].nativeType).toEqual(JSType.Number);
                expect(params[2].required).toEqual(true);
                expect(params[2].validValues.length).toEqual(0);
                expect(params[2].canBeNull).toEqual(false);
                expect(params[2].canBeEmpty).toEqual(false);
                expect(params[2].defaultValue).toEqual("");

                //Parameter #4: TestParam4DoubleWithThrow:
                expect(params[3].position).toEqual(3);
                expect(params[3].name).toEqual("TestParam4DoubleWithThrow");
                expect(params[3].description).toEqual("");
                expect(params[3].type).toEqual(PSType.Double);
                expect(params[3].nativeType).toEqual(JSType.Number);
                expect(params[3].required).toEqual(false);
                expect(params[3].validValues.length).toEqual(0);
                expect(params[3].canBeNull).toEqual(true);
                expect(params[3].canBeEmpty).toEqual(true);
                expect(params[3].defaultValue).toEqual(`$(throw "-TestParam3 is required.")`);

                //Parameter #5: TestParam5SwitchWithNoDataType:
                expect(params[4].position).toEqual(-2147483648);
                expect(params[4].name).toEqual("TestParam5SwitchWithNoDataType");
                expect(params[4].description).toEqual("");
                expect(params[4].type).toEqual(PSType.Switch);
                expect(params[4].nativeType).toEqual(JSType.Boolean);
                expect(params[4].required).toEqual(false);
                expect(params[4].validValues.length).toEqual(0);
                expect(params[4].canBeNull).toEqual(true);
                expect(params[4].canBeEmpty).toEqual(true);
                expect(params[4].defaultValue).toEqual(`$false`);

                //Parameter #6: TestParam6JustParamName:
                expect(params[5].name).toEqual("TestParam6JustParamName");
                expect(params[5].description).toEqual("");
                expect(params[5].type).toEqual(PSType.Object);
                expect(params[5].nativeType).toEqual(JSType.Object);
                expect(params[5].required).toEqual(false);
                expect(params[5].validValues.length).toEqual(0);
                expect(params[5].canBeNull).toEqual(true);
                expect(params[5].canBeEmpty).toEqual(true);
                expect(params[5].defaultValue).toEqual("");

                //Parameter #7: TestParam7StringWithValidateScriptAndHelpMessage:
                expect(params[6].name).toEqual("TestParam7StringWithValidateScriptAndHelpMessage");
                expect(params[6].description).toEqual("This is the TestParam7 with a help message.");
                expect(params[6].type).toEqual(PSType.String);
                expect(params[6].nativeType).toEqual(JSType.String);
                expect(params[6].required).toEqual(true);
                expect(params[6].validValues.length).toEqual(0);
                expect(params[6].canBeNull).toEqual(true);
                expect(params[6].canBeEmpty).toEqual(true);
                expect(params[6].defaultValue).toEqual("");

                //Parameter #8: TestParam8DateTimeWithHelpMessage:
                expect(params[7].name).toEqual("TestParam8DateTimeWithHelpMessage");
                expect(params[7].description).toEqual("This is the TestParam8 with a help message.");
                expect(params[7].type).toEqual(PSType.DateTime);
                expect(params[7].nativeType).toEqual(JSType.Date);
                expect(params[7].required).toEqual(false);
                expect(params[7].validValues.length).toEqual(0);
                expect(params[7].canBeNull).toEqual(false);
                expect(params[7].canBeEmpty).toEqual(false);
                expect(params[7].defaultValue).toEqual("");

                //Parameter #9: TestParam9WIthValidateLength:
                expect(params[8].name).toEqual("TestParam9WIthValidateLength");
                expect(params[8].description).toEqual("This is the TestParam9 with a help message.");
                expect(params[8].type).toEqual(PSType.String);
                expect(params[8].nativeType).toEqual(JSType.String);
                expect(params[8].required).toEqual(false);
                expect(params[8].validValues.length).toEqual(0);
                expect(params[8].canBeNull).toEqual(true);
                expect(params[8].canBeEmpty).toEqual(true);

                //Parameter #10: TestParam10WIthValidateRange:
                expect(params[9].name).toEqual("TestParam10WIthValidateRange");
                expect(params[9].description).toEqual("This is the TestParam10 with a help message.");
                expect(params[9].type).toEqual(PSType.Int32);
                expect(params[9].nativeType).toEqual(JSType.Number);
                expect(params[9].required).toEqual(false);
                expect(params[9].validValues.length).toEqual(0);
                expect(params[9].canBeNull).toEqual(true);
                expect(params[9].canBeEmpty).toEqual(true);
                expect(params[9].defaultValue).toEqual(5);

                //Parameter #11: TestParam11WIthArray:
                expect(params[10].name).toEqual("TestParam11WIthArray");
                expect(params[10].description).toEqual("This is the TestParam11 with default.");
                expect(params[10].type).toEqual(PSType.Array);
                expect(params[10].nativeType).toEqual(JSType.Array);
                expect(params[10].required).toEqual(false);
                expect(params[10].validValues.length).toEqual(0);
                expect(params[10].canBeNull).toEqual(true);
                expect(params[10].canBeEmpty).toEqual(true);
                expect(params[10].defaultValue).toEqual(`@("One", "Two")`);

                done();
            })  

        
    }, 20000)
});

