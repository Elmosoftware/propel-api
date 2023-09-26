// @ts-check
import { Target } from "../../../propel-shared/models/target";
import { Script } from "../../../propel-shared/models/script";
import { SystemHelper } from "../../util/system-helper";
import { Workflow } from "../../../propel-shared/models/workflow";
import { WorkflowStep } from "../../../propel-shared/models/workflow-step";
import { Credential } from "../../../propel-shared/models/credential";
import { CredentialTypes } from "../../../propel-shared/models/credential-types";
import { ParameterValue } from "../../../propel-shared/models/parameter-value";
import { Secret } from "../../../propel-shared/models/secret";
import { WindowsSecret } from "../../../propel-shared/models/windows-secret";
import { AWSSecret } from "../../../propel-shared/models/aws-secret";
import { ScriptParameter } from "../../../propel-shared/models/script-parameter";
import { JSType, PSType } from "../../../propel-shared/core/type-definitions";

export class TestingWorkflows {

    constructor() {
    }

    get SecretWindows01(): Secret<WindowsSecret>{
        let ret = new Secret<WindowsSecret>(WindowsSecret);

        ret._id = "SecretWindows01"
        ret.value.userName = "UserName";
        ret.value.domain = "Domain";
        ret.value.password = "Password";

        return ret;
    }

    get CredentialWindows01(): Credential {
        let pv1 = new ParameterValue()
        pv1.name = "Field01W"
        pv1.value = "Windows cred Field 01"

        let pv2 = new ParameterValue()
        pv2.name = "Field02W"
        pv2.value = "Windows cred Field 02"
        
        let ret: Credential = new Credential()
        ret._id = "CredentialWindows01"
        ret.name = ret._id
        ret.description = "Windows Credential for testing"
        ret.credentialType = CredentialTypes.Windows
        ret.fields = [pv1, pv2]
        ret.secretId = "SecretWindows01"

        return ret;
    }

    get SecretAWS02(): Secret<AWSSecret>{
        let ret = new Secret<AWSSecret>(AWSSecret);

        ret._id = "SecretAWS02"
        ret.value.accessKey = "AccessKey";
        ret.value.secretKey = "SecretKey";

        return ret;
    }

    get CredentialAWS02(): Credential {
        let pv1 = new ParameterValue()
        pv1.name = "Field01AWS"
        pv1.value = "AWS cred Field 01"

        let pv2 = new ParameterValue()
        pv2.name = "Field02AWS"
        pv2.value = "AWS cred Field 02"
        
        let ret: Credential = new Credential()
        ret._id = "CredentialAWS02"
        ret.name = ret._id
        ret.description = "AWS Credential for testing"
        ret.credentialType = CredentialTypes.AWS
        ret.fields = [pv1, pv2]
        ret.secretId = "SecretAWS02"

        return ret;
    }

    get SecretWindows03(): Secret<WindowsSecret>{
        let ret = new Secret<WindowsSecret>(WindowsSecret);

        ret._id = "SecretWindows03"
        ret.value.userName = "UserName3";
        ret.value.domain = "Domain3";
        ret.value.password = "Password3";

        return ret;
    }

    get CredentialWindows03(): Credential {
        let pv1 = new ParameterValue()
        pv1.name = "Field01W"
        pv1.value = "Windows 03 cred Field 01"

        let pv2 = new ParameterValue()
        pv2.name = "Field02W"
        pv2.value = "Windows 03 cred Field 02"
        
        let ret: Credential = new Credential()
        ret._id = "CredentialWindows03"
        ret.name = ret._id
        ret.description = "Windows Credential for testing"
        ret.credentialType = CredentialTypes.Windows
        ret.fields = [pv1, pv2]
        ret.secretId = "SecretWindows03"

        return ret;
    }

    get Target01Enabled(): Target {
        let ret: Target = new Target()
        ret.FQDN = "server01.propel.com"
        ret.friendlyName = "Server #01"
        ret.description = "Fake enabled server Server 01"
        ret.enabled = true;
        return ret;
    }

    get Target02Enabled(): Target {
        let ret: Target = new Target()
        ret.FQDN = "server02.propel.com"
        ret.friendlyName = "Server #02"
        ret.description = "Fake enabled server Server 02"
        ret.enabled = true;
        return ret;
    }

    get Target03Enabled(): Target {
        let ret: Target = new Target()
        ret.FQDN = "server03.propel.com"
        ret.friendlyName = "Server #03"
        ret.description = "Fake enabled server Server 03"
        ret.enabled = true;
        return ret;
    }

    get Target04Disabled(): Target {
        let ret: Target = new Target()
        ret.FQDN = "server04.propel.com"
        ret.friendlyName = "Server #04"
        ret.description = "Fake enabled server Server 04"
        ret.enabled = false;
        return ret;
    }

    get Target05EnabledWithCredentials(): Target {
        let ret: Target = new Target()
        ret.FQDN = "server05.propel.com"
        ret.friendlyName = "Server #05"
        ret.description = "Fake enabled server Server 05"
        ret.enabled = true;
        ret.invokeAs = this.CredentialWindows01;
        return ret;
    }

    get Target06EnabledWithCredentials(): Target {
        let ret: Target = new Target()
        ret.FQDN = "server06.propel.com"
        ret.friendlyName = "Server #06"
        ret.description = "Fake enabled server Server 06"
        ret.enabled = true;
        ret.invokeAs = this.CredentialWindows03;
        return ret;
    }

    get ScriptNoParamsNoTargetUltraFastThreeResultsNoThrow(): Script {
        let ret: Script = new Script();

        ret.name = "NOPARAMS-NOTARGET-ULTRAFAST-3RESULTS-NOTHROW"
        ret.description = "Script with no parameters, not targetting servers, ultrafast executions and returning 3 results. No throwing error."
        ret.isTargettingServers = false;
        ret.parameters = [];
        ret.code = this._getEncodedScriptCode(ret.name, "", "ULTRAFAST", 3, false)

        return ret;
    }

    get ScriptNoParamsNoTargetMediumThreeResultsNoThrow(): Script {
        let ret: Script = new Script();

        ret.name = "NOPARAMS-NOTARGET-MEDIUM-3RESULTS-NOTHROW"
        ret.description = "Script with no parameters, not targetting servers, medium executions and returning 3 results. No throwing error."
        ret.isTargettingServers = false;
        ret.parameters = [];
        ret.code = this._getEncodedScriptCode(ret.name, "", "MEDIUM", 3, false)

        return ret;
    }

    get ScriptNoParamsNoTargetMediumOneResultNoThrow(): Script {
        let ret: Script = new Script();

        ret.name = "NOPARAMS-NOTARGET-MEDIUM-1RESULT-NOTHROW"
        ret.description = "Script with no parameters, not targetting servers, medium executions and returning 1 result. No throwing error."
        ret.isTargettingServers = false;
        ret.parameters = [];
        ret.code = this._getEncodedScriptCode(ret.name, "", "MEDIUM", 1, false)

        return ret;
    }

    get ScriptNoParamsNoTargetUltraFastThreeResultsThrow(): Script {
        let ret: Script = new Script();

        ret.name = "NOPARAMS-NOTARGET-ULTRAFAST-3RESULTS-THROW"
        ret.description = "Script with no parameters, not targetting servers, ultrafast executions and returning 3 results. Throwing error."
        ret.isTargettingServers = false;
        ret.parameters = [];
        ret.code = this._getEncodedScriptCode(ret.name, "", "ULTRAFAST", 3, true)

        return ret;
    }

    get ScriptNoParamsTargetUltraFastTwoResultsNoThrow(): Script {
        let ret: Script = new Script();

        ret.name = "NOPARAMS-NOTARGET-ULTRAFAST-2RESULTS-NOTHROW"
        ret.description = "Script with no parameters, targetting servers, ultrafast executions and returning 2 results. No throwing error."
        ret.isTargettingServers = true;
        ret.parameters = [];
        ret.code = this._getEncodedScriptCode(ret.name, "", "ULTRAFAST", 2, false)

        return ret;
    }

    get ScriptNoParamsTargetFastTwoResultsNoThrow(): Script {
        let ret: Script = new Script();

        ret.name = "NOPARAMS-NOTARGET-FAST-2RESULTS-NOTHROW"
        ret.description = "Script with no parameters, targetting servers, fast execution and returning 2 results. No throwing error."
        ret.isTargettingServers = true;
        ret.parameters = [];
        ret.code = this._getEncodedScriptCode(ret.name, "", "FAST", 2, false)

        return ret;
    }

    get ScriptWithPropelCredentialsTargetFastTwoResultsNoThrow(): Script {
        let ret: Script = new Script();
        let sp = new ScriptParameter();

        sp.name = "PropelCredentials"
        sp.nativeType = JSType.Object
        sp.required = false
        sp.type = PSType.Object
        sp.canBeEmpty = true
        sp.canBeNull = true
        sp.isPropelParameter = true
        sp.hasDefault = false

        ret.name = "WITHPROPELCRED-WITHTARGETS-FAST-2RESULTS-NOTHROW"
        ret.description = "Script with a propelcredentials parameter, targetting servers, fast execution and returning 2 results. No throwing error."
        ret.isTargettingServers = true;
        ret.parameters = [sp];
        ret.code = this._getEncodedScriptCode(ret.name, `param (
            $PropelCredentials
)`, "FAST", 2, false)

        return ret;
    }

    get ScriptWithMultipleParametersTargetFastTwoResultsNoThrow(): Script {
        let ret: Script = new Script();
        let sp1 = new ScriptParameter();
        let sp2 = new ScriptParameter();
        let sp3 = new ScriptParameter();

        sp1.name = "NumericParam"
        sp1.nativeType = JSType.Number
        sp1.required = true
        sp1.type = PSType.Int32
        sp1.canBeEmpty = false
        sp1.canBeNull = false
        sp1.isPropelParameter = false
        sp1.hasDefault = true
        sp1.defaultValue = "12"

        sp2.name = "StringParam"
        sp2.nativeType = JSType.String
        sp2.required = false
        sp2.type = PSType.String
        sp2.canBeEmpty = true
        sp2.canBeNull = true
        sp2.isPropelParameter = false
        sp2.hasDefault = false

        sp3.name = "PropelCredentials"
        sp3.nativeType = JSType.Object
        sp3.required = false
        sp3.type = PSType.Object
        sp3.canBeEmpty = true
        sp3.canBeNull = true
        sp3.isPropelParameter = true
        sp3.hasDefault = false

        ret.name = "WithMultipleParametersTargetFastTwoResultsNoThrow"
        ret.description = "Script with a Numeric required parameter, a String parameter and a Propelcredentials parameter, targetting servers, fast execution and returning 2 results. No throwing error."
        ret.isTargettingServers = true;
        ret.parameters = [sp1, sp2, sp3];
        ret.code = this._getEncodedScriptCode(ret.name, `param (
            [Parameter(Mandatory=$true)]
            [ValidateNotNullOrEmpty()]
            [int]$NumericParam = 12,
            [string]$StringParam,
            $PropelCredentials
)`, "FAST", 2, false)

        return ret;
    }

    get Workflow_S1EnabledNoParamNoTargetNoThrow(): Workflow{
        let ret: Workflow = new Workflow();

        ret._id = "000000010000000000100001"
        ret.name = "Workflow_S1EnabledNoParamNoTargetNoThrow"
        ret.description = "Workflow with Step 1:ScriptNoParamsNoTargetUltraFastThreeResultsNoThrow."

        let step1: WorkflowStep = new WorkflowStep();
        step1.name = "STEP #1"
        step1.abortOnError = true;
        step1.enabled = true
        step1.script = this.ScriptNoParamsNoTargetUltraFastThreeResultsNoThrow;
        step1.targets = []
        step1.values = []

        ret.steps.push(step1);

        return ret;
    }

    get Workflow_S1EnabledNoParamNoTargetNoThrowMediumDuration(): Workflow{
        let ret: Workflow = new Workflow();

        ret._id = "000000010000000000100002"
        ret.name = "Workflow_S1EnabledNoParamNoTargetNoThrowMediumDuration"
        ret.description = "Workflow with Step 1:ScriptNoParamsNoTargetMediumThreeResultsNoThrow."

        let step1: WorkflowStep = new WorkflowStep();
        step1.name = "STEP #1"
        step1.abortOnError = true;
        step1.enabled = true
        step1.script = this.ScriptNoParamsNoTargetMediumThreeResultsNoThrow;
        step1.targets = []
        step1.values = []

        ret.steps.push(step1);

        return ret;
    }

    get Workflow_S1EnabledNoParamNoTargetThrow(): Workflow{
        let ret: Workflow = new Workflow();

        ret._id = "000000010000000000100003"
        ret.name = "Workflow_S1EnabledNoParamNoTargetThrow"
        ret.description = "Workflow with Step 1:ScriptNoParamsNoTargetUltraFastThreeResultsThrow."

        let step1: WorkflowStep = new WorkflowStep();
        step1.name = "Mi quis hendrerit dolor magna eget est lorem ipsum. Morbi quis commodo odio aenean sed."
        step1.abortOnError = true;
        step1.enabled = true
        step1.script = this.ScriptNoParamsNoTargetUltraFastThreeResultsThrow;
        step1.targets = []
        step1.values = []

        ret.steps.push(step1);

        return ret;
    }

    get Workflow_S2Enabled(): Workflow{
        let ret: Workflow = new Workflow();

        ret._id = "000000010000000000100004"
        ret.name = "Workflow_S2Enabled"
        ret.description = "Workflow with Step 1:ScriptNoParamsTargetUltraFastTwoResultsNoThrow, Step2: ScriptNoParamsNoTargetUltraFastThreeResultsNoThrow."

        let step: WorkflowStep = new WorkflowStep();
        step.name = "STEP #1"
        step.abortOnError = true;
        step.enabled = true
        step.script = this.ScriptNoParamsTargetUltraFastTwoResultsNoThrow;
        step.targets = [this.Target01Enabled, this.Target02Enabled]
        step.values = []

        ret.steps.push(step);

        step = new WorkflowStep();
        step.name = "STEP #2"
        step.abortOnError = true;
        step.enabled = true
        step.script = this.ScriptNoParamsNoTargetUltraFastThreeResultsNoThrow;
        step.targets = [];
        step.values = []

        ret.steps.push(step);

        return ret;
    }

    get Workflow_S2EnabledThrow(): Workflow{
        let ret: Workflow = new Workflow();

        ret._id = "000000010000000000100005"
        ret.name = "Workflow_S2EnabledThrow"
        ret.description = "Workflow with Step 1:ScriptNoParamsNoTargetUltraFastThreeResultsThrow, Step 2: ScriptNoParamsNoTargetUltraFastThreeResultsNoThrow."

        let step: WorkflowStep = new WorkflowStep();
        step.name = "STEP #1"
        step.abortOnError = true;
        step.enabled = true
        step.script = this.ScriptNoParamsNoTargetUltraFastThreeResultsThrow;
        step.targets = []
        step.values = []

        ret.steps.push(step);

        step = new WorkflowStep();
        step.name = "STEP #2"
        step.abortOnError = true;
        step.enabled = true
        step.script = this.ScriptNoParamsNoTargetUltraFastThreeResultsNoThrow;
        step.targets = [];
        step.values = []

        ret.steps.push(step);

        return ret;
    }

    get Workflow_S2EnabledTargetDisabled(): Workflow{
        let ret: Workflow = new Workflow();

        ret._id = "000000010000000000100006"
        ret.name = "Workflow_S2EnabledTargetDisabled"
        ret.description = "Workflow with Step 1:ScriptNoParamsTargetUltraFastTwoResultsNoThrow, Step 2:ScriptNoParamsTargetUltraFastTwoResultsNoThrow."

        let step: WorkflowStep = new WorkflowStep();
        step.name = "STEP #1"
        step.abortOnError = true;
        step.enabled = true
        step.script = this.ScriptNoParamsTargetUltraFastTwoResultsNoThrow;
        step.targets = [this.Target01Enabled]
        step.values = []

        ret.steps.push(step);

        step = new WorkflowStep();
        step.name = "STEP #2"
        step.abortOnError = true;
        step.enabled = true
        step.script = this.ScriptNoParamsTargetUltraFastTwoResultsNoThrow;
        step.targets = [this.Target04Disabled];
        step.values = []

        ret.steps.push(step);

        return ret;
    }

    get Workflow_S2EnabledTargetDisabledFast(): Workflow{
        let ret: Workflow = new Workflow();

        ret._id = "000000010000000000100007"
        ret.name = "Workflow_S2EnabledTargetDisabledFast"
        ret.description = "Workflow with Step 1:ScriptNoParamsTargetFastTwoResultsNoThrow, Step 2:ScriptNoParamsTargetUltraFastTwoResultsNoThrow."

        let step: WorkflowStep = new WorkflowStep();
        step.name = "STEP #1 FAST"
        step.abortOnError = true;
        step.enabled = true
        step.script = this.ScriptNoParamsTargetFastTwoResultsNoThrow;
        step.targets = [this.Target01Enabled]
        step.values = []

        ret.steps.push(step);

        step = new WorkflowStep();
        step.name = "STEP #2 ULTRAFAST"
        step.abortOnError = true;
        step.enabled = true
        step.script = this.ScriptNoParamsTargetUltraFastTwoResultsNoThrow;
        step.targets = [this.Target02Enabled];
        step.values = []

        ret.steps.push(step);

        return ret;
    }

    get Workflow_S2EnabledNoParamNoTargetNoThrowMediumDuration(): Workflow{
        let ret: Workflow = new Workflow();

        ret._id = "000000010000000000100008"
        ret.name = "Workflow_S2EnabledNoParamNoTargetNoThrowMediumDuration"
        ret.description = "Workflow with Step 1:ScriptNoParamsNoTargetMediumThreeResultsNoThrow and Step 2: ."

        let step1: WorkflowStep = new WorkflowStep();
        step1.name = "Arcu non sodales neque sodales ut etiam sit amet."
        step1.abortOnError = true;
        step1.enabled = true
        step1.script = this.ScriptNoParamsNoTargetMediumThreeResultsNoThrow;
        step1.targets = []
        step1.values = []

        ret.steps.push(step1);

        let step2: WorkflowStep = new WorkflowStep();
        step2.name = "Pharetra vel turpis nunc eget lorem dolor sed. Id volutpat lacus laoreet non. Accumsan lacus vel facilisis volutpat est."
        step2.abortOnError = true;
        step2.enabled = true
        step2.script = this.ScriptNoParamsNoTargetMediumOneResultNoThrow;
        step2.targets = []
        step2.values = []

        ret.steps.push(step2);

        return ret;
    }

    get Workflow_S1Enabled2TargetsEnabledWithCredFast(): Workflow{
        let ret: Workflow = new Workflow();
        
        ret._id = "000000010000000000100009"
        ret.name = "Workflow_S1Enabled2TargetsEnabledWithCredFast"
        ret.description = "Workflow with Step 1:ScriptNoParamsTargetFastTwoResultsNoThrow:ScriptNoParamsTargetUltraFastTwoResultsNoThrow."

        let pv = new ParameterValue();
        pv.name = "PropelCredentials"
        pv.value = testingWorkflows.CredentialAWS02._id
        pv.nativeType = JSType.Object

        let step: WorkflowStep = new WorkflowStep();
        step.name = "STEP #1 FAST"
        step.abortOnError = true;
        step.enabled = true
        step.script = this.ScriptWithPropelCredentialsTargetFastTwoResultsNoThrow;
        step.targets = [this.Target05EnabledWithCredentials, this.Target06EnabledWithCredentials]
        step.values = [pv];

        ret.steps.push(step);
        
        return ret;
    }

    get Workflow_S3EnabledWithParamsAndRuntimeParamsWithTargetNoThrowFastDuration(): Workflow{
        let ret: Workflow = new Workflow();

        ret._id = "000000010000000000100010"
        ret.name = "Workflow_S3EnabledWithParamsAndRuntimeParamsWithTargetNoThrowFastDuration"
        ret.description = "Workflow with 3 steps including runtime parameters."

        //Creating STEP 1: Script without parameters
        //-------------------------------------------
        let step1: WorkflowStep = new WorkflowStep();
        step1.name = "Step 1: This step has no parameters"
        step1.abortOnError = true;
        step1.enabled = true
        step1.script = this.ScriptNoParamsNoTargetUltraFastThreeResultsNoThrow;
        step1.targets = []
        step1.values = []

        ret.steps.push(step1);

        //Creating STEP 2: Script with 3 parameters, 2 of them marked as Runtime Parameters:
        //----------------------------------------------------------------------------------
        let step2: WorkflowStep = new WorkflowStep();
        step2.name = "Step 2: This step has 2 runtime parameters."
        step2.abortOnError = true;
        step2.enabled = true
        step2.script = this.ScriptWithMultipleParametersTargetFastTwoResultsNoThrow;
        step2.targets = [this.Target01Enabled]

        let step2pv1 = new ParameterValue();
        step2pv1.name = "NumericParam"
        step2pv1.value = "1" //We emulate a change of the value from 12 (the default) to 1 by the user 
        //that creates the Workflow. Anyway, and because this is a Runtime Parameter, this value can 
        //change again right before to run the Workflow.
        step2pv1.nativeType = JSType.Number
        step2pv1.isRuntimeParameter = true

        let step2pv2 = new ParameterValue();
        step2pv2.name = "StringParam"
        step2pv2.value = ""
        step2pv2.nativeType = JSType.String
        step2pv2.isRuntimeParameter = true

        let step2pv3 = new ParameterValue();
        step2pv3.name = "PropelCredentials"
        step2pv3.value = this.CredentialWindows01._id
        step2pv3.nativeType = JSType.Object
        step2pv3.isRuntimeParameter = false

        step2.values = [step2pv1, step2pv2, step2pv3]

        ret.steps.push(step2);

        //Creating STEP 3: Script with 3 parameters, none of them marked as Runtime Parameters:
        //-------------------------------------------------------------------------------------
        let step3: WorkflowStep = new WorkflowStep();
        step3.name = "Step 3: This step has no runtime parameters."
        step3.abortOnError = true;
        step3.enabled = true
        step3.script = this.ScriptWithMultipleParametersTargetFastTwoResultsNoThrow;
        step3.targets = [this.Target01Enabled]

        let step3pv1 = new ParameterValue();
        step3pv1.name = "NumericParam"
        step3pv1.value = "2"
        step3pv1.nativeType = JSType.Number
        step3pv1.isRuntimeParameter = false

        let step3pv2 = new ParameterValue();
        step3pv2.name = "StringParam"
        step3pv2.value = "String value"
        step3pv2.nativeType = JSType.String
        step3pv2.isRuntimeParameter = false

        let step3pv3 = new ParameterValue();
        step3pv3.name = "PropelCredentials"
        step3pv3.value = this.CredentialWindows01._id
        step3pv3.nativeType = JSType.Object
        step3pv3.isRuntimeParameter = false

        step3.values = [step3pv1, step3pv2, step3pv3]

        ret.steps.push(step3);

        return ret;
    }

    getWorkflowById(id: string): Workflow | undefined {

        switch (id) {
            case "000000010000000000100001":
                return this.Workflow_S1EnabledNoParamNoTargetNoThrow
            case "000000010000000000100002": 
                return this.Workflow_S1EnabledNoParamNoTargetNoThrowMediumDuration
            case "000000010000000000100003":
                return this.Workflow_S1EnabledNoParamNoTargetThrow
            case "000000010000000000100004":
                return this.Workflow_S2Enabled
            case "000000010000000000100005":
                return this.Workflow_S2EnabledThrow
            case "000000010000000000100006":
                return this.Workflow_S2EnabledTargetDisabled
            case "000000010000000000100007":
                return this.Workflow_S2EnabledTargetDisabledFast
            case "000000010000000000100008":
                return this.Workflow_S2EnabledNoParamNoTargetNoThrowMediumDuration
            case "000000010000000000100009":
                return this.Workflow_S1Enabled2TargetsEnabledWithCredFast
            case "000000010000000000100010":
                return this.Workflow_S3EnabledWithParamsAndRuntimeParamsWithTargetNoThrowFastDuration
            default:
                return undefined;
        }
    }

    private _getEncodedScriptCode(scriptName: string, paramsDef: string, durationType: string, 
        resultCount: number = 1, mustThrow: boolean = false): string {

        return SystemHelper.encodeBase64(`
<#
Here description
#>
#region Script Parameters
${paramsDef}
#endregion

#region External Modules
<#
    Recall that any module added here need to exist on remote server.
#>

#endregion

#region Private Methods
    
#endregion

#region Private Members

$results = @()
    
#endregion

#region Public Methods

#endregion

#region Script Body

$scriptName = "${scriptName}"
$isTargettingServers = $true
$hasParams = $${(paramsDef)? "true" : "false"}
$durationType = "${durationType}"
$totalResults = ${resultCount}
$mustThrow = $${(mustThrow)? "true" : "false"}
$longerText = @"
Donec adipiscing tristique risus nec feugiat in fermentum posuere. Vulputate ut pharetra sit amet. 
In hendrerit gravida rutrum quisque non tellus orci.
"@

Write-Output "Starting script execution ..."
Write-Output "Script Name: $scriptName" 

$waitTime = switch ($durationType) {
   "ULTRAFAST" { 0.1; break}
   "FAST" { 3; break}
   "MEDIUM" { 15; break}
   "SLOW" { 60*1; break}
   "ULTRASLOW" { 60*3; break}
}

Write-Output "Waiting ..."
Start-Sleep -Seconds $waitTime
if($mustThrow) {
    throw "This error is from the script!"
}
Write-Output "Adding results ..."
 
for($i=1; $i -le $totalResults; $i++) {
    $results += ([pscustomobject]@{ \`
            ResultNbr = $i; \`
            Name = $scriptName; \`
            Targetting = $isTargettingServers; \`
            HasParams = $hasParams; \`
            Duration = $durationType; \`
            LongerText = $longerText; \`
            })
}

Write-Output "Execution is done! ..."

return $results | ConvertTo-Json -Compress

#endregion`
        );
    }
}

export let testingWorkflows = new TestingWorkflows();