// @ts-check

import { Target } from "../../models/target";
import { Script } from "../../models/script";
import { FileSystemHelper } from "../../util/file-system-helper";
import { Workflow } from "../../models/workflow";
import { WorkflowStep } from "../../models/workflow-step";

export class TestingWorkflows {

    constructor() {

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

    get Worflow_S1EnabledNoParamNoTargetNoThrow(): Workflow{
        let ret: Workflow = new Workflow();

        ret.name = "Worflow_S1NoParamNoTargetNoThrow"
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

    get Worflow_S1EnabledNoParamNoTargetNoThrowMediumDuration(): Workflow{
        let ret: Workflow = new Workflow();

        ret.name = "Worflow_S1EnabledNoParamNoTargetNoThrowMediumDuration"
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

    get Worflow_S1EnabledNoParamNoTargetThrow(): Workflow{
        let ret: Workflow = new Workflow();

        ret.name = "Worflow_S1NoParamNoTargetThrow"
        ret.description = "Workflow with Step 1:ScriptNoParamsNoTargetUltraFastThreeResultsThrow."

        let step1: WorkflowStep = new WorkflowStep();
        step1.name = "STEP #1"
        step1.abortOnError = true;
        step1.enabled = true
        step1.script = this.ScriptNoParamsNoTargetUltraFastThreeResultsThrow;
        step1.targets = []
        step1.values = []

        ret.steps.push(step1);

        return ret;
    }

    get Worflow_S2Enabled(): Workflow{
        let ret: Workflow = new Workflow();

        ret.name = "Worflow_S2Enabled"
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

    get Worflow_S2EnabledThrow(): Workflow{
        let ret: Workflow = new Workflow();

        ret.name = "Worflow_S2EnabledThrow"
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

    get Worflow_S2EnabledTargetDisabled(): Workflow{
        let ret: Workflow = new Workflow();

        ret.name = "Worflow_S2EnabledTargetDisabled"
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


    private _getEncodedScriptCode(scriptName: string, paramsDef: string, durationType: string, 
        resultCount: number = 1, mustThrow: boolean = false): string {

        return FileSystemHelper.encodeBase64(`
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