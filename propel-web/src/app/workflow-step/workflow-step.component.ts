import { Component, OnInit, Input, EventEmitter, ViewChild, Output, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormGroup, Validators, FormControl, FormArray, ValidatorFn } from '@angular/forms';
import { forkJoin, from } from "rxjs";
import { NgSelectComponent } from '@ng-select/ng-select';

import { Script } from '../../../../propel-shared/models/script';
import { compareEntities } from '../../../../propel-shared/models/entity';
import { Target } from '../../../../propel-shared/models/target';
import { FormHandler } from 'src/core/form-handler';
import { WorkflowStep } from '../../../../propel-shared/models/workflow-step';
import { ValidatorsHelper } from 'src/core/validators-helper';
import { CoreService } from 'src/services/core.service';
import { QueryModifier } from '../../../../propel-shared/core/query-modifier';
import { ScriptParameter } from '../../../../propel-shared/models/script-parameter';
import { SharedSystemHelper } from '../../../../propel-shared/utils/shared-system-helper';
import { ParameterValue } from '../../../../propel-shared/models/parameter-value';
import { DataEndpointActions } from 'src/services/data.service';
import { Utils } from "../../../../propel-shared/utils/utils";
import { Credential } from '../../../../propel-shared/models/credential';
import { CredentialTypes } from '../../../../propel-shared/models/credential-types';
import { PagedResponse } from '../../../../propel-shared/core/paged-response';
import { CustomValueDialogData } from '../dialogs/custom-value-dlg/custom-value-dlg.component';
import { DialogResult } from 'src/core/dialog-result';

/**
 * Minimum step name length.
 */
const NAME_MIN: number = 3;

/**
 * Maximum step name length.
 */
 const NAME_MAX: number = 50;

/**
 * TARGETS_MAX is the maximum amount of targets you can add to a step.
 * 
 * Be aware this number is related to the following Propel API environment variables:
 * 
 *  - **POOL_MAX_SIZE**: Total pool size, this mean the total amount of PowerShell processes 
 * the API is allowed to create.
 *  - **POOL_QUEUE_SIZE**: This is the maximum amount of requests that will be queued when all the 
 * current PowerShell processes are busy.
 * 
 * The relationship between this configuration settings is:
 * 
 * **TARGETS_MAX** have to be less than **POOL_MAX_SIZE** + **POOL_QUEUE_SIZE**
 * 
 * If this is not the case you will have a "ObjectPool memory queue overflow" exception.
 */
const TARGETS_MAX: number = 20;

/**
 * Maximum amount of credentials you can set for a $PropelCredentials script parameter value.
 */
const CREDENTIALS_MAX: number = 5;

@Component({
  selector: 'app-workflow-step',
  templateUrl: './workflow-step.component.html',
  styleUrls: ['./workflow-step.component.css']
})
export class WorkflowStepComponent implements OnInit {

  /**
   * Indicates if the form need to be prepared to edit a quick task.
   * If the value is false, the form will be prepared to edit a new or already existing
   * workflow step.
   */
  @Input("quick-task") isQuickTask: boolean;

  /**
   * The workflow step to edit. If no value provided a new Workflow step will be created 
   * either for a quieck task or not.
   */
  @Input("step") step: WorkflowStep;

  /**
   * Change event, will be throw every time the form suffer any change.
   */
  @Output() change = new EventEmitter<WorkflowStepComponentStatus>();

  @ViewChild("script") scriptDropdown;
  @ViewChild('targets') targets: NgSelectComponent;
  @ViewChild('credentials') credentials: NgSelectComponent;
  @ViewChildren('ngSelectArrays') ngSelectArrays: QueryList<NgSelectComponent>;

  private requestCount$: EventEmitter<number>;
  fh: FormHandler<WorkflowStep>;
  allScripts: Script[];
  allTargets: Target[];
  allCredentials: Credential[];
  selectedScript: Script | undefined;
  validSets: any = {};
  quickTaskId: string = "";
  credentialTypes = CredentialTypes;

  get parameterValues(): FormArray {
    return (this.fh.form.controls.values as FormArray);
  }

  constructor(private core: CoreService) {

  }

  ngOnInit(): void {
    let nameValidators: any[] = [Validators.required]

    //For a quicktask the isalways fixed, no need to add the validators for the name length:
    if (!this.isQuickTask) {
      nameValidators.push(Validators.minLength(NAME_MIN));
      nameValidators.push(Validators.maxLength(NAME_MAX));
    }

    this.fh = new FormHandler("WorkflowStep", new FormGroup({
      name: new FormControl("", nameValidators),
      enabled: new FormControl(true, [
        Validators.required
      ]),
      abortOnError: new FormControl(true, [
        Validators.required
      ]),
      script: new FormControl("", [
        Validators.required
      ]),
      targets: new FormControl(""),
      values: new FormArray([])
    }));

    this.requestCount$ = this.core.navigation.getHttpRequestCountSubscription()
    this.requestCount$
      .subscribe((count: number) => {
        if (count > 0) {
          this.fh.form.disable({ emitEvent: false });
        }
        else {
          this.fh.form.enable({ emitEvent: false });
        }
      })

    //Doing this with a timeout to avoid the "ExpressionChangedAfterItHasBeenCheckedError" error:
    setTimeout(() => {
      forkJoin({
        scripts: from(this.refreshScripts()),
        targets: from(this.refreshTargets()),
        credentials: (this.refreshCredentials())
        //if there is anything else to refresh, add it here...
      })
        .subscribe((results) => {

          //We are adding here a temporary field "disabled" for both, (Scripts and Targets), this field 
          //is required for the @NgSelect component to identify disabled items in the list and prevent 
          //them to be selected:

          //@ts-ignore
          this.allScripts = results.scripts.data.map(item => {
            //@ts-ignore
            item.disabled = !item.enabled;
            return item;
          });

          //@ts-ignore
          this.allTargets = results.targets.data.map(item => {
            //@ts-ignore
            item.disabled = !item.enabled;
            return item;
          });

          //@ts-ignore
          this.allCredentials = results.credentials.data.map(item => {
            //@ts-ignore
            item.disabled = false;
            return item;
          });

          this.setValue(this.step);
        });
    });
  }

  addNewValue(selectId: number) {
    //From all the NGSelect used for arrays, we need to choose the one with the specific id:
    let select: NgSelectComponent = this.ngSelectArrays.find((control: NgSelectComponent) => {
      return Number(control.element.attributes.getNamedItem("id").value) == selectId
    })
    
    let paramName: string = select.element.attributes.getNamedItem("title").value
    let param = this.tryGetParameter(paramName)
    let isNumberArray: boolean = false
    let dlgTitle: string = ""
    
    if (param) {
      isNumberArray = (param.type == "System.Int32[]")
      dlgTitle = `Add a new ${(isNumberArray) ? "numeric" : "text"} value for $${param.name}`
    }
    
    select.close(); //Closing the ng-select before to show the dialog to avoid the dialog 
    //displaying behing the select. 

    this.core.dialog.showCustomValueDialog({ typeIsString: !isNumberArray, title: dlgTitle})
    .subscribe((result: DialogResult<CustomValueDialogData>) => {
      if (!result.isCancel) {
        select.itemsList.addItem(result.value.value);
        let item = select.itemsList.findItem(result.value.value);
        select.select(item);
      }
    }, err => {
      throw err
    });
  }

  refreshScripts(): Promise<PagedResponse<Script>> {
    let qm: QueryModifier = new QueryModifier();
    qm.sortBy = "name";
    return (this.core.data.find(DataEndpointActions.Script, qm)) as unknown as Promise<PagedResponse<Script>>;
  }

  refreshTargets(): Promise<PagedResponse<Target>> {
    let qm: QueryModifier = new QueryModifier();
    qm.sortBy = "friendlyName";
    return (this.core.data.find(DataEndpointActions.Target, qm)) as unknown as Promise<PagedResponse<Target>>;
  }

  refreshCredentials(): Promise<PagedResponse<Credential>> {
    let qm: QueryModifier = new QueryModifier();
    qm.sortBy = "name";
    return (this.core.data.find(DataEndpointActions.Credential, qm)) as unknown as Promise<PagedResponse<Credential>>;
  }

  getScriptFromCache(id: string): Script | undefined {
    return this.allScripts.find((script: Script) => {
      return script._id == String(id);
    });
  }

  getTargetFromCache(id: string): Target | undefined {
    return this.allTargets.find((target: Target) => {
      return target._id == String(id);
    });
  }

  getCredentialFromCacheByName(name: string): Credential | undefined {
    return this.allCredentials.find((credential: Credential) => {
      return credential.name == String(name);
    });
  }

  getQuickTaskName(): string {
    let ret: string = ""
    let scriptLabel = (this.selectedScript) ? ` for ${this.selectedScript.name}` : "";

    if (!this.quickTaskId) {
      this.quickTaskId = SharedSystemHelper.getUniqueId();
    }

    ret = `Quick Task${scriptLabel} #${this.quickTaskId}`;

    return ret;
  }

  setValue(value?: WorkflowStep) {

    if (!value) {
      value = new WorkflowStep();

      value.abortOnError = true;
      value.enabled = true;

      //A quick task doesn't require a name. Is not a repetible action, so 
      //we are assigning one name randomly:
      if (this.isQuickTask) {
        value.name = this.getQuickTaskName();
      }
    }
    else if (typeof value.script == "string") {
      value.script = this.getScriptFromCache(value.script);
    }

    this.step = value;
    this.scriptChanged(this.step.script);

    this.fh.form.statusChanges
      .subscribe((value: string) => {

        let status: WorkflowStepComponentStatus;
        let step = Object.assign({}, this.fh.value)

        //We need to convert back boolean values to PowerShell Booleans:
        // this.convertParameterValuesFromJStoPS(step.values);
        if (step.values && step.values.length > 0) {
          step.values.forEach((pv) => {
            //If is a propel parameter, we need to flaten the array of credential ids:
            if (this.isPropelParameter(pv.name) && pv.value && Array.isArray(pv.value)) {
              pv.value = pv.value.join(",")
            }
            else {
              //For array types, sometimes ng-select returns the item object, instead of 
              //only the value:
              if (pv.nativeType == "Array" && Array.isArray(pv.value)) {
                (pv.value as Array<any>) = (pv.value as Array<any>)
                  .map((val) => {
                    if (typeof val == "object" && val.value) return val.value
                    else return val
                  })
              }

              Utils.JavascriptToPowerShellValueConverter(pv);
            }
          })
        }

        status = new WorkflowStepComponentStatus(
          Boolean(value.toLowerCase() == "valid"),
          this.fh.form.dirty,
          step,
          (this.selectedScript) ? this.selectedScript.name : "",
          this.getselectedTargetNames());
        this.change.emit(status);
      })

    this.fh.setValue(value);
  }

  /**
   * Used by the dropdowns to compare the values.
   */
  compareFn: Function = compareEntities;

  scriptChanged($event: Script) {
    this.selectedScript = $event;

    //Every time the selected script changed, we need to review the 
    //targets validators and control value:
    if (this.selectedScript) {
      //If the script is targetting servers, we need to ensure at least one:
      if (this.selectedScript.isTargettingServers) {
        this.fh.form.controls.targets.setValidators([
          ValidatorsHelper.minItems(1),
          ValidatorsHelper.maxItems(TARGETS_MAX)
        ])
      }
      else {
        this.fh.form.controls.targets.clearValidators();
        this.fh.form.controls.targets.patchValue([]);
      }
    }

    this.enableOrDisableTargets();

    if (this.isQuickTask) {
      this.fh.form.controls.name.patchValue(this.getQuickTaskName());
    }

    this.fh.form.updateValueAndValidity();
    this.initializeParameters();
  }

  enableOrDisableTargets() {
    //Disabling on the next cycle of the loop in order to avoid issues when 
    //displaying this component inside a dialog:
    setTimeout(() => {
      if (this.selectedScript && this.selectedScript.isTargettingServers) {
        this.fh.form.controls.targets.enable({ onlySelf: true, emitEvent: false })
      }
      else {
        this.fh.form.controls.targets.disable({ onlySelf: true, emitEvent: false })
      }
      this.fh.form.updateValueAndValidity();
    });
  }

  dropTargetItem(item: any) {
    this.targets.clearItem(item);
  }

  dropCredentialItem(item: any) {
    this.credentials.clearItem(item);
  }

  private initializeParameters() {

    let newValues: ParameterValue[] = [];

    //Removing all the controls for the parameter values:
    (this.fh.form.controls.values as FormArray).controls.splice(0, (this.fh.form.controls.values as FormArray).controls.length);
    this.fh.form.controls.values.reset();
    this.fh.form.updateValueAndValidity();

    //If there is no selected script or it has no parameters:
    if (!this.selectedScript || !this.selectedScript.parameters || this.selectedScript.parameters.length == 0) {
      return;
    }

    this.selectedScript.parameters.forEach((p: ScriptParameter) => {

      let pv: ParameterValue;
      let vfns: ValidatorFn[] = [];
      let fg: FormGroup;

      //First we pair the parameters in the selected scrip with the values, (if any), already
      //provided in the "step" input:
      if (this.step.values) {
        pv = this.step.values.find((item: ParameterValue) => {
          return item.name == p.name;
        });
      }

      //If the parameter value exists:
      if (pv) {
        //We need to verify validity. If is not the same type, we need to fix it:
        if (pv.nativeType !== p.nativeType) {
          pv.nativeType = p.nativeType
          pv.value = (p.hasDefault) ? p.defaultValue : "";
        }
      }
      else { //If the parameter values doesn't exists, we will create it with the script parameter 
        //default value:
        pv = new ParameterValue();
        pv.name = p.name;
        pv.nativeType = p.nativeType
        pv.value = (p.hasDefault) ? p.defaultValue : "";
      }

      //If the parameter has a valid set defined, we need to add it to our valid sets object:
      if (p.validValues && p.validValues.length > 0) {
        this.validSets[p.name] = this.buildValidSet(p.validValues);

        //If the actual parameter value is invalid, we are going to remove it:
        if (pv.value && !(this.validSets[p.name] as any[]).find(item => item.value == pv.value)) {
          pv.value = "";
        }
      }

      //Assigning the validators based on the parameter type and if it is required or not:
      switch (p.nativeType) {
        case "Number":
          vfns.push(ValidatorsHelper.anyNumber());
          break;
        case "Date":
          vfns.push(ValidatorsHelper.anyDate());
          break;
        default:
          break;
      }

      if (p.isPropelParameter) {
        vfns.push(ValidatorsHelper.maxItems(CREDENTIALS_MAX));
        //For the form edition, we need to convert the string value of the propel parameter in a string array:
        if (pv.value) {
          //@ts-ignore
          pv.value = pv.value.split(",")
        }
      }

      if (p.required) {
        vfns.push(Validators.required)
      }

      //Converting the native Powershell value representation to a Javascript native value:
      Utils.PowerShellToJavascriptValueConverter(pv);

      //Adding the controls to the array:
      fg = new FormGroup({
        name: new FormControl(pv.name),
        value: new FormControl(pv.value, vfns),
        nativeType: new FormControl(pv.nativeType)
      });

      (this.fh.form.controls.values as FormArray).push(fg);

      newValues.push(pv);
    })

    this.step.values = newValues;
  }

  getPlaceHolderText(nativeType: string) {

    let ret: string = ""

    switch (nativeType) {
      case "String":
        ret = "Any text is accepted here.";
        break;
      case "Number":
        ret = "Please enter any number here.";
        break;
      case "Date":
        ret = `Please enter a valid date here. Format must be ISO-8601. e.g.: "YYYY-MM-DDThh:mm:ss" time must be 24hs format.`
        break;
      case "Array":
        ret = `You can specify multiple values here separated by a comma. e.g.: Value 1, Value 2, Value 3.`
        break;
      case "Object":
        ret = `This value will be passed literally to the script, watch out for any typos.`
        break;
      default:
        break;
    }

    return ret;
  }

  tryGetParameter(paramName: string): ScriptParameter | null {

    let ret: ScriptParameter = null;

    if (this.selectedScript && this.selectedScript.parameters && this.selectedScript.parameters.length > 0) {
      ret = this.selectedScript.parameters.find((p: ScriptParameter) => {
        return p.name == paramName;
      });
    }

    return ret;
  }

  getParamDescription(paramName: string): string {

    let ret: string = "";
    let param: ScriptParameter;

    param = this.tryGetParameter(paramName);

    if (param && param.description) {
      ret = param.description;
    }

    return ret;
  }

  isPropelParameter(paramName: string): boolean {
    let ret: boolean = false;
    let param: ScriptParameter;

    param = this.tryGetParameter(paramName);

    ret = param && param.isPropelParameter;

    return ret;
  }

  getCredentialType(credentialName: string): CredentialTypes {
    let cred = this.getCredentialFromCacheByName(credentialName);

    if (cred) return cred.credentialType
    else return CredentialTypes.Windows;

  }

  getselectedTargetNames(): string[] {
    let ret: string[] = [];

    this.fh.form.controls.targets.value.forEach((id: string) => {
      let target: Target = this.getTargetFromCache(id);

      if (target) {
        ret.push(target.friendlyName);
      }
    })

    return ret;
  }

  hasValidSet(paramName: string): boolean {
    return (this.validSets[paramName] && this.validSets[paramName].length > 0);
  }

  buildValidSet(validSet: string[]): any[] {

    let ret: any[] = [];

    validSet.forEach((value) => {
      ret.push({ value: value, label: value });
    });

    return ret;
  }

  getValidSet(paramName: string): any[] {
    if (!this.hasValidSet(paramName)) return []
    return this.validSets[paramName];
  }

  ///////////////////////////////////////////////////////////////////////
  //DEBUG:
  // sampleFormOrControlStatus(control: AbstractControl): string {
  //   let ret: string = ""

  //   ret += (control.pristine) ? "pristine" : "dirty";
  //   ret += (control.valid) ? ", valid" : ", invalid";
  //   ret += (control.touched) ? ", touched" : ", untouched";

  //   return ret;
  // }
  //////////////////////////////////////////////////////////////////////
}

/**
 * Returned by this component on the change event.
 */
export class WorkflowStepComponentStatus {
  readonly isValid: boolean;
  readonly isDirty: boolean;
  readonly step?: WorkflowStep;
  readonly scriptName?: string;
  readonly targetNames?: string[];

  constructor(isValid: boolean, isDirty: boolean, step?: WorkflowStep,
    scriptName?: string, targetNames?: string[]) {
    this.isValid = isValid,
      this.isDirty = isDirty;
    this.step = step;
    this.scriptName = scriptName;
    this.targetNames = (targetNames) ? targetNames : [];
  }
}
