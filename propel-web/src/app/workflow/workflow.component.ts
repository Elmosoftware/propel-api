import { UntypedFormGroup, UntypedFormControl, Validators, FormArray, UntypedFormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Component, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgSelectComponent } from '@ng-select/ng-select';

import { CoreService } from 'src/services/core.service';
import { DialogResult } from 'src/core/dialog-result';
import { Workflow } from '../../../../propel-shared/models/workflow';
import { FormHandler } from 'src/core/form-handler';
import { compareEntities } from '../../../../propel-shared/models/entity';
import { WorkflowStep } from '../../../../propel-shared/models/workflow-step';
import { ParameterValue } from '../../../../propel-shared/models/parameter-value';
import { WorkflowStepComponentStatus } from '../workflow-step/workflow-step.component';
import { DataLossPreventionInterface } from 'src/core/data-loss-prevention-guard';
import { ValidatorsHelper } from 'src/core/validators-helper';
import { Target } from '../../../../propel-shared/models/target';
import { DataEndpointActions } from 'src/services/data.service';
import { JSType } from '../../../../propel-shared/core/type-definitions';
import { Script } from '../../../../propel-shared/models/script';
import { WorkflowSchedule, ScheduleUnit,  
  MonthlyOptionOrdinal, MonthlyOptionDayOfTheMonth,
  EVERY_AMOUNT_MIN, EVERY_AMOUNT_MAX } from "../../../../propel-shared/models/workflow-schedule";
import { WeekDay } from "../../../../propel-shared/utils/shared-system-helper";
import { Utils } from '../../../../propel-shared/utils/utils';

const NAME_MIN: number = 3;
const NAME_MAX: number = 50;
const DESCRIPTION_MAX: number = 512;
const STEPS_MAX: number = 10;

enum Tabs {
  Definition = 0,
  Steps = 1,
  Schedule = 2
}

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.css']
})
export class WorkflowComponent implements OnInit, DataLossPreventionInterface {

  @ViewChild("everyUnit") scheduleUnitsDropdown!: NgSelectComponent;
  @ViewChild("weeklyOptions") weeklyOptionsDropdown!: NgSelectComponent;
  @ViewChild("monthlyOptionOrdinal") monthlyOptionOrdinalDropdown!: NgSelectComponent;
  @ViewChild("monthlyOptionDay") monthlyOptionDayDropdown!: NgSelectComponent;

  private requestCount$: EventEmitter<number>;
  fh: FormHandler<Workflow>;
  scriptNames: Map<string, string> = new Map<string, string>();
  targetNames: Map<string, string[]> = new Map<string, string[]>();
  showAddNewButton: boolean = false;
  showChangeOrderAlert: boolean = true;
  isDragging: boolean = false;
  activeTab: Tabs = Tabs.Definition;
  allScheduleUnits: { key: string, value: string | number }[] = [];
  allWeekDays: { key: string, value: string | number }[] = [];
  allMonthlyOptionOrdinals: { key: string, value: string | number }[] = [];
  allMonthlyOptionDays: { key: string, value: string | number }[] = [];

  /**
   * Used by the dropdowns to compare the values.
   */
  compareFn: Function = compareEntities;

  get steps(): UntypedFormArray {
    return (this.fh.form.controls['steps'] as UntypedFormArray);
  }

  get name(): UntypedFormControl {
    return (this.fh.form.controls['name'] as UntypedFormControl);
  }

  get description(): UntypedFormControl {
    return (this.fh.form.controls['description'] as UntypedFormControl);
  }

  get scheduleFormGroup(): FormGroup {
    return (this.fh.form.controls['schedule'] as FormGroup);
  }

  get isSingleExecutionSchedule(): boolean {
    if (this.scheduleFormGroup?.controls['isRecurrent']) {
      return !this.scheduleFormGroup?.controls['isRecurrent'].value;
    }
    else {
      return false;
    }
  }

  constructor(private core: CoreService, private route: ActivatedRoute) {
    this.fh = new FormHandler(DataEndpointActions.Workflow, new UntypedFormGroup({
      name: new UntypedFormControl("", [
        Validators.required,
        Validators.minLength(NAME_MIN),
        Validators.maxLength(NAME_MAX)
      ]),
      description: new UntypedFormControl("", [
        Validators.maxLength(DESCRIPTION_MAX)
      ]),
      isQuickTask: new UntypedFormControl(""),
      steps: new FormArray([], [
        ValidatorsHelper.minItems(1),
        ValidatorsHelper.maxItems(STEPS_MAX)]),
      schedule: new UntypedFormGroup({
        enabled: new UntypedFormControl(false, []),
        isRecurrent: new UntypedFormControl(false, []),
        onlyOn: new UntypedFormControl(null, []),
        everyAmount: new UntypedFormControl(1, []),
        everyUnit: new UntypedFormControl(ScheduleUnit.Days, []),
        weeklyOptions: new UntypedFormControl([], []),
        monthlyOption: new UntypedFormGroup({
          ordinal: new UntypedFormControl(MonthlyOptionOrdinal.First, []),
          day: new UntypedFormControl(MonthlyOptionDayOfTheMonth["Day of the Month"], [])
        }),
        startingAt: new UntypedFormControl("00:00", []),
        lastExecution: new UntypedFormControl(null, [])
      })
    }));

    this.requestCount$ = this.core.navigation.getHttpRequestCountSubscription()
    this.requestCount$
      .subscribe({
        next: (count: number) => {
          if (count > 0) {
            this.fh.form.disable({ emitEvent: false });
          }
          else {
            this.fh.form.enable({ emitEvent: false });
          }
        }
      })
  }

  dataChanged(): boolean | Observable<boolean> | Promise<boolean> {
    return this.core.dataChanged(this.fh);
  }

  ngOnInit(): void {
    this.core.setPageTitle(this.route.snapshot.data);
    this.allScheduleUnits = Utils.getEnum(ScheduleUnit)
    this.allWeekDays = Utils.getEnum(WeekDay)
    this.allMonthlyOptionOrdinals = Utils.getEnum(MonthlyOptionOrdinal)
    this.allMonthlyOptionDays = [...Utils.getEnum(MonthlyOptionDayOfTheMonth), ...Utils.getEnum(WeekDay)]

    this.refreshData()
      .catch((error) => {
        this.core.handleError(error)
      })
  }

  async refreshData(): Promise<void> {
    let id: string = this.route.snapshot.paramMap.get("id") ?? "";

    if (!id) {
      this.newItem();
      return Promise.resolve();
    }

    try {
      let workflow: Workflow = await this.core.data.getById(DataEndpointActions.Workflow, id, true) as Workflow;

      if (!workflow) {
        this.core.toaster.showWarning("If you access directly with a link, maybe is broken. Go to the Browse page and try a search.", "Could not find the item")
        this.newItem();
        return Promise.resolve();
      }

      this.fh.setValue(workflow);
      this.createStepsFormArray(workflow.steps);
      this.extractScriptNameAndTargetFromWorkflow(workflow);
      this.setScheduleForm(this.fh.value.schedule)
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  newItem() {
    let w = new Workflow();
    this.fh.setValue(w);
    this.createStepsFormArray(w.steps, true);
    this.setScheduleForm(w.schedule)
    this.showAddNewButton = false;
    this.activeTab = Tabs.Definition;
  }

  extractScriptNameAndTargetFromStatus(status: WorkflowStepComponentStatus): void {
    let step: WorkflowStep = status.step!;
    let scriptId: string = this.getEntityId(step.script);

    if (scriptId && !this.scriptNames.has(scriptId)) {
      this.scriptNames.set(scriptId, status.scriptName!)
    }

    if (step.targets && step.targets.length > 0) {
      this.targetNames.set(step.targets.join(), status.targetNames!);
    }
  }

  extractScriptNameAndTargetFromWorkflow(w: Workflow): void {
    if (w && w.steps && w.steps.length > 0) {
      w.steps.forEach((ws: WorkflowStep) => {
        let scriptId: string = this.getEntityId(ws.script);

        if (scriptId && ws.script.name && !this.scriptNames.has(scriptId)) {
          this.scriptNames.set(scriptId, ws.script.name);
        }

        if (ws.targets && ws.targets.length > 0) {
          this.targetNames.set(ws.targets.map((t: Target) => t._id).join(),
            ws.targets.map((t: Target) => t.friendlyName));
        }
      })
    }
  }

  addStep() {
    this.fh.form.controls['steps'].markAllAsTouched();
    this.core.dialog.showWorkflowStepDialog(new WorkflowStep())
      .subscribe({
        next: (dlgResults: DialogResult<WorkflowStepComponentStatus>) => {

          if (!dlgResults.isCancel) {

            let status: WorkflowStepComponentStatus = dlgResults.value;
            let step = status.step;

            if (step) {
              this.createStepsFormArray([step]);
              this.extractScriptNameAndTargetFromStatus(status);
              this.fh.form.updateValueAndValidity();
              this.fh.form.markAsDirty();
            }
          }
        },
        error: (err) => {
          this.core.handleError(err)
        }
      }
      );
  }

  createStepsFormArray(steps: WorkflowStep[], clearBeforeAdd: boolean = false): void {
    if (clearBeforeAdd) {
      (this.fh.form.controls['steps'] as UntypedFormArray).clear();
    }

    if (steps && steps.length > 0) {
      steps.forEach((step: WorkflowStep) => {
        let valuesArray = new UntypedFormArray([]);

        step.values.forEach((pv: ParameterValue) => {
          valuesArray.push(new UntypedFormGroup({
            name: new UntypedFormControl(pv.name),
            value: new UntypedFormControl(pv.value),
            nativeType: new UntypedFormControl(pv.nativeType),
            isRuntimeParameter: new UntypedFormControl(pv.isRuntimeParameter)
          }))
        });

        //Adding the controls to the array:
        (this.fh.form.controls['steps'] as FormArray).push(new UntypedFormGroup({
          name: new UntypedFormControl(step.name),
          enabled: new UntypedFormControl(step.enabled),
          abortOnError: new UntypedFormControl(step.abortOnError),
          script: new UntypedFormControl(step.script),
          targets: new UntypedFormControl(step.targets),
          values: valuesArray
        }));
      })
    }
  }

  stopShowingChangeStepOrderAlert() {
    this.showChangeOrderAlert = false;
  }

  editStep(stepIndex: number) {
    this.fh.form.controls['steps'].markAllAsTouched();
    this.core.dialog.showWorkflowStepDialog(this.getStep(stepIndex))
      .subscribe({
        next: (dlgResults: DialogResult<WorkflowStepComponentStatus>) => {

          if (!dlgResults.isCancel) {

            let status: WorkflowStepComponentStatus = dlgResults.value;
            let step = status.step;

            if (step) {
              /*Why we need to do this instead of a simple patch?:
              This is to prevent the case where a parameter is removed from the script. If that's the case 
              the parameter values collection will keep the removed parameter if we do a patch, because the 
              item won't be removed from the FormArray. 
              So to ensure this, we need to recreate the step in the Form.
              */
              let allSteps: WorkflowStep[] = this.fh.value.steps;
              allSteps[stepIndex] = step;
              this.createStepsFormArray(allSteps, true);

              this.extractScriptNameAndTargetFromStatus(status);
              this.fh.form.updateValueAndValidity();
              this.fh.form.markAsDirty();
            }
          }
        },
        error: (err) => {
          this.core.handleError(err)
        }
      }
      );
  }

  removeStep(stepIndex: number) {
    (this.fh.form.controls['steps'] as UntypedFormArray).removeAt(stepIndex);
    this.fh.form.controls['steps'].markAllAsTouched();
    this.fh.form.controls['steps'].markAsDirty();
  }

  getEntityId(script: any): string {
    let ret: string = "";

    if (script && typeof script == "string") {
      ret = script;
    }
    else if (script && script._id) {
      ret = script._id;
    }

    return ret;
  }

  getStep(stepIndex: number): WorkflowStep {
    return ((this.fh.form.controls['steps'] as UntypedFormArray).controls[stepIndex].value as WorkflowStep);
  }

  getStepName(stepIndex: number): string {
    return this.getStep(stepIndex).name
  }

  getScriptName(stepIndex: number): string {
    let ret: string = "";
    let step = this.getStep(stepIndex);
    let scriptId: string = this.getEntityId(step.script);

    if (this.scriptNames.has(scriptId)) {
      ret = this.scriptNames.get(scriptId)!;
    }

    return ret;
  }

  getTargetNames(stepIndex: number): string {
    let ret: string = "";
    let step = this.getStep(stepIndex);
    let targetIds: string = (step.targets && step.targets.length > 0) ?
      step.targets.map((t) => this.getEntityId(t)).join() : "";
    if (this.targetNames.has(targetIds)) {
      ret = this.targetNames.get(targetIds)!.join(", ");
    }
    else {
      ret = "None";
    }

    return ret;
  }

  getParameterValues(stepIndex: number): string {
    let ret: string = "";
    let step = this.getStep(stepIndex);

    if (step && step.values && step.values.length > 0) {
      step.values.forEach((pv: ParameterValue, i: number) => {
        let quotes: string = (pv.nativeType == JSType.String) ? `"` : "";
        let sep: string = (i < step.values.length - 1) ? ", " : "";
        ret += `${pv.name} = ${quotes}${pv.value}${quotes}${sep}`;
      })
    }
    else {
      ret = "None";
    }

    return ret;
  }

  getStepDetails(stepIndex: number, longDetails: boolean = false): string {
    let ret: string = `Script: "${this.getScriptName(stepIndex)}".
Targets: ${this.getTargetNames(stepIndex)}.
Parameters: ${this.getParameterValues(stepIndex)}.`

    return (longDetails) ? ret : ret.slice(0, 50);
  }

  save(run: boolean = false): void {
    //We can reduce the payload by excluding the entire script object and the targets and 
    //sending only the ObjectId for each one of them:
    let data: Workflow = Object.assign({}, this.fh.value);

    if (data.steps) {
      data.steps.forEach((step: WorkflowStep) => {
        if (step.script && step.script._id) {
          step.script = (step.script._id as unknown as Script);
        }

        if (step.targets) {
          step.targets.forEach((target: Target, i) => {
            if (target && target._id) {
              step.targets[i] = (target._id as unknown as Target);
            }
          });
        }
      });
    }

    this.core.data.save(DataEndpointActions.Workflow, data)
      .then((id: string) => {
        this.core.toaster.showSuccess("Changes have been saved succesfully.");
        this.fh.setId(id);
        this.fh.setValue(this.fh.value) //This is the saved value now, so setting this value 
        //will allow the "Cancel" button to come back to this version.
        this.showAddNewButton = true;
        this.activeTab = Tabs.Definition;

        //Replacing in the navigation history the URL so when the user navigate back 
        //and if we are creating an item it will edit the created item instead of showing 
        //a new item form:
        this.core.navigation.replaceHistory(this.fh.getId());

        if (run) {
          //Redirecting to run page to execute the workflow:
          this.core.navigation.toRun(this.fh.getId());
        }
      },
        (error) => {
          this.core.handleError(error)
        }
      );
  }

  resetForm() {
    this.fh.resetForm();
    this.activeTab = Tabs.Definition
    //Sadly the form array values are not restored automatically to the previous values: 
    this.createStepsFormArray(this.fh.previousValue.steps, true);
    this.setScheduleForm(this.fh.value.schedule)
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray((this.fh.form.controls['steps'] as UntypedFormArray).controls,
      event.previousIndex, event.currentIndex);
  }

  dragStarted(event: any) {
    this.isDragging = true;
  }

  dragReleased(event: any) {
    this.isDragging = false;
  }

  /**
   * This event is raised when the schedule gets enabled or disabled.
   * @param $event State event data
   */
  onEnabledChange($event: { checked: boolean }) {
    this.changeAllScheduleControlsState($event.checked);
  }

  /**
   * This event is raised when the schedule type change.
   * @param $event Schedule type change event data.
   */
  onScheduleTypeChange($event: any) {
    setTimeout(() => {
      this.setScheduleForm(this.fh.value.schedule)
    });
  }

  /**
   * This event is raised when the schedule unit for a recurrent schedule is changed.
   * @param $event Schedule unit change event data.
   */
  onScheduleUnitChange($event: { key: string, value: string | number }) {
    this.scheduleFormGroup.controls["monthlyOption"].enable({ onlySelf: true, emitEvent: false });
    this.scheduleFormGroup.controls["weeklyOptions"].enable({ onlySelf: true, emitEvent: false });

    switch ($event.key) {
      case ScheduleUnit.Weeks:
        this.scheduleFormGroup.controls["monthlyOption"].disable({ onlySelf: true, emitEvent: false });
        break;
      case ScheduleUnit.Months:
        this.scheduleFormGroup.controls["weeklyOptions"].disable({ onlySelf: true, emitEvent: false });
        break;
      default:
        this.scheduleFormGroup.controls["monthlyOption"].disable({ onlySelf: true, emitEvent: false });
        this.scheduleFormGroup.controls["weeklyOptions"].disable({ onlySelf: true, emitEvent: false });
        break;
    }

    this.scheduleFormGroup.controls["monthlyOption"].updateValueAndValidity();
    this.scheduleFormGroup.controls["weeklyOptions"].updateValueAndValidity();

    setTimeout(() => {
      this.setScheduleFormValidators()
    });
  }

  /**
   * Prepare the schedule form for edition by: Reassigning dropdown values, enabling the right 
   * fields, adding/removing validators.
   * @param value Workflow schedule
   */
  setScheduleForm(value: WorkflowSchedule) {
    let item: any = null;

    if (value.isRecurrent){
      //For some reason when the NGSelect controls are hidden, they lost the active selection, so 
      //we need to set the selected values again: 

      //Schedule units:
      if (this.scheduleUnitsDropdown) {
        item = this.scheduleUnitsDropdown.itemsList.items.find((item) => {
          return item.value.key == value.everyUnit
        });

        if (item) {
          this.scheduleUnitsDropdown.select(item); //Selecting the value in the dropdown.      
        }
      }

      if (this.weeklyOptionsDropdown) {
        //Weekly options
        this.weeklyOptionsDropdown.clearModel(); //Clearing all selections.

        value.weeklyOptions.forEach((weekday: WeekDay) => {
          let item = this.weeklyOptionsDropdown.itemsList.items.find((item) => item.value.value == weekday)!
          this.weeklyOptionsDropdown.select(item);
        })
      }

      //Monthly options ordinal:
      if (this.monthlyOptionOrdinalDropdown) {
        item = this.monthlyOptionOrdinalDropdown.itemsList.items.find((item) => {
          return item.value.key == value.monthlyOption.ordinal
        });

        if (item) {
          this.monthlyOptionOrdinalDropdown.select(item);
        }
      }

      //Monthly options day:
      if (this.monthlyOptionDayDropdown) {
        item = this.monthlyOptionDayDropdown.itemsList.items.find((item) => {
          return item.value.value == value.monthlyOption.day
        });

        if (item) {
          this.monthlyOptionDayDropdown.select(item);
        }
      }
    }

    this.scheduleFormGroup.updateValueAndValidity();
    this.scheduleFormGroup.markAsPristine();
    this.scheduleFormGroup.markAsUntouched();

    setTimeout(() => {
      this.changeAllScheduleControlsState(value.enabled)
    });
  }

  /**
   * Enabled/disabled the schedule form controls accordingly.
   * If the schedule form controls gets enabled, this method will also 
   * disable additional fields based on the form data.
   * @param enabled Enabled indicator.
   */
  changeAllScheduleControlsState(enabled: boolean) {
    let s: WorkflowSchedule = this.fh.value.schedule;

    for (const controlName in this.scheduleFormGroup.controls) {
        this.changeScheduleControlsState(controlName, enabled, false)
    }

    //If it's a recurrent schedule, there is other controls that need to be 
    //disabled based on selections:
    if (s.isRecurrent && enabled) {
      this.changeScheduleControlsState("weeklyOptions", s.everyUnit == ScheduleUnit.Weeks, false)
      this.changeScheduleControlsState("monthlyOption", s.everyUnit == ScheduleUnit.Months, false)
    }

    setTimeout(() => {
      this.setScheduleFormValidators()
    });
  }

  /**
   * Enable/disable a schedule form control and optionally update all the controls validators.
   * @param controlName Name of the control in the schedule form.
   * @param enabled Control state, (enable/disabled).
   * @param updateValidators Boolean value to force update validators. If "false" validators will not be updated
  */
  changeScheduleControlsState(controlName: string, enabled: boolean, updateValidators: boolean = true) {
    if (controlName == "enabled") return; // We can't disable de "Enabled" control itself!!

    if (enabled) {
      this.scheduleFormGroup.controls[controlName].enable({ onlySelf: true, emitEvent: false });
    }
    else {
      this.scheduleFormGroup.controls[controlName].disable({ onlySelf: true, emitEvent: false });
    }
    
    if (updateValidators) {
      setTimeout(() => {
        this.setScheduleFormValidators()
      });
    }
  }

  /**
   * Set the appropiate schedul form controls validators based in the kind of schedule that is being edited.
   */
  setScheduleFormValidators() {
    let s: WorkflowSchedule = this.fh.value.schedule;

    if (s.isRecurrent) {
      //Removing Validators for the single execution controls:
      this.scheduleFormGroup.controls["onlyOn"].clearValidators();
      this.scheduleFormGroup.controls["onlyOn"].updateValueAndValidity();
      
      //Adding Validators for the recurrent controls:
      this.scheduleFormGroup.controls["everyAmount"].clearValidators();
      if (s.enabled) {
        this.scheduleFormGroup.controls["everyAmount"].addValidators([
        ValidatorsHelper.notNullOrEmpty(),
        Validators.min(EVERY_AMOUNT_MIN), 
        Validators.max(EVERY_AMOUNT_MAX)]);
      }      
      this.scheduleFormGroup.controls["everyAmount"].updateValueAndValidity();
      
      this.scheduleFormGroup.controls["weeklyOptions"].clearValidators();
      if (s.everyUnit == ScheduleUnit.Weeks && s.enabled) {
        this.scheduleFormGroup.controls["weeklyOptions"].addValidators(ValidatorsHelper.minItems(1));
      }
      this.scheduleFormGroup.controls["weeklyOptions"].updateValueAndValidity();
    }
    else {
      //Adding Validators for the Single execution controls:
      this.scheduleFormGroup.controls["onlyOn"].clearValidators();
      if (s.enabled) {
        this.scheduleFormGroup.controls["onlyOn"].addValidators(ValidatorsHelper.notNullOrEmpty());
      }
      this.scheduleFormGroup.controls["onlyOn"].updateValueAndValidity();
      
      //Removing Validators for the recurrent controls:
      this.scheduleFormGroup.controls["everyAmount"].clearValidators();
      this.scheduleFormGroup.controls["everyAmount"].updateValueAndValidity();
      this.scheduleFormGroup.controls["weeklyOptions"].clearValidators();
      this.scheduleFormGroup.controls["weeklyOptions"].updateValueAndValidity();
    }

    this.scheduleFormGroup.updateValueAndValidity();
    this.scheduleFormGroup.markAsPristine();
    this.scheduleFormGroup.markAsUntouched();
  }

  activeTabChanged($event: Tabs) {
    this.activeTab = $event

    if (this.activeTab == Tabs.Schedule) {
      setTimeout(() => {
        this.setScheduleForm(this.fh.value.schedule)
      });
    }
  }

  isTabDisabled(tabIndex: Tabs): boolean {
    let ret: boolean = false

    if (this.fh.form.disabled) {
      ret = true;
    }
    else if (tabIndex == Tabs.Definition) {
      ret = false;
    }
    else if (tabIndex == Tabs.Steps) {
      ret = this.name.invalid || this.description.invalid;
    }
    else if (tabIndex == Tabs.Schedule) {
      ret = this.steps.invalid;
    }

    return ret;
  }

  isPreviousButtonDisabled(): boolean {
    return this.activeTab == Tabs.Definition || this.isTabDisabled(this.activeTab - 1);
  }

  isNextButtonDisabled(): boolean {
    return this.activeTab == Tabs.Schedule || this.isTabDisabled(this.activeTab + 1);
  }

  isCancelButtonVisible(): boolean {
    return !this.fh.form.pristine
  }

  isAddNewButtonVisible(): boolean {
    return this.showAddNewButton
  }

  isSaveButtonVisible(): boolean {
    return this.isCancelButtonVisible() && this.fh.form.valid
  }

  next() {
    this.activeTab++;
  }

  back() {
    this.activeTab--;
  }
}
