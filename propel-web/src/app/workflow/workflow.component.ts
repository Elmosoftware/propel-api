import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Component, OnInit, ViewChild, EventEmitter } from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

import { CoreService } from 'src/services/core.service';
import { EntityDialogConfiguration } from '../dialogs/entity-group-dlg/entity-dlg.component';
import { Category } from '../../../../propel-shared/models/category';
import { DialogResult } from 'src/core/dialog-result';
import { APIResponse } from '../../../../propel-shared/core/api-response';
import { Workflow } from '../../../../propel-shared/models/workflow';
import { FormHandler } from 'src/core/form-handler';
import { compareEntities } from '../../../../propel-shared/models/entity';
import { QueryModifier } from '../../../../propel-shared/core/query-modifier';
import { WorkflowStep } from '../../../../propel-shared/models/workflow-step';
import { ParameterValue } from '../../../../propel-shared/models/parameter-value';
import { WorkflowStepComponentStatus } from '../workflow-step/workflow-step.component';
import { DataLossPreventionInterface } from 'src/core/data-loss-prevention-guard';
import { ValidatorsHelper } from 'src/core/validators-helper';
import { Target } from '../../../../propel-shared/models/target';
import { DataEntity } from 'src/services/data.service';

const NAME_MIN: number = 3;
const NAME_MAX: number = 50;
const DESCRIPTION_MAX: number = 512;
const STEPS_MAX: number = 10;

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.css']
})
export class WorkflowComponent implements OnInit, DataLossPreventionInterface {

  @ViewChild("category") category;

  private requestCount$: EventEmitter<number>;
  fh: FormHandler<Workflow>;
  allCategories: Category[] = [];
  scriptNames: Map<string, string> = new Map<string, string>();
  targetNames: Map<string, string[]> = new Map<string, string[]>();
  showAddNewButton: boolean = false;
  showChangeOrderAlert: boolean = true;
  isDragging: boolean = false;


  /**
   * Used by the dropdowns to compare the values.
   */
  compareFn: Function = compareEntities;

  get steps(): FormArray {
    return (this.fh.form.controls.steps as FormArray);
  }

  constructor(private core: CoreService, private route: ActivatedRoute) {

    this.fh = new FormHandler(DataEntity.Workflow, new FormGroup({
      name: new FormControl("", [
        Validators.required,
        Validators.minLength(NAME_MIN),
        Validators.maxLength(NAME_MAX)
      ]),
      description: new FormControl("", [
        Validators.maxLength(DESCRIPTION_MAX)
      ]),
      isQuickTask: new FormControl(""),
      category: new FormControl("", [
        Validators.required
      ]),
      steps: new FormArray([], [
        ValidatorsHelper.minItems(1),
        ValidatorsHelper.maxItems(STEPS_MAX)])
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
  }

  dataChanged(): boolean | Observable<boolean> | Promise<boolean> {
    return this.core.dataChanged(this.fh);
  }

  ngOnInit(): void {
    this.core.setPageTitle(this.route.snapshot.data);
    this.refreshData();
    this.refreshCategories();
  }

  refreshData(): void {
    let id: string = this.route.snapshot.paramMap.get("id");

    if (id) {
      this.core.data.getById(DataEntity.Workflow, id, true)
        .subscribe((data: APIResponse<Workflow>) => {
          if (data.count == 0) {
            this.core.toaster.showWarning("If you access directly with a link, maybe is broken. Go to the Browse page and try a search.", "Could not find the item")
            this.newItem();
          }
          else {
            let w: Workflow = data.data[0];
            this.fh.setValue(w);
            this.createStepsFormArray(w.steps);
            this.extractScriptNameAndTargetFromWorkflow(w);
          }
        },
          err => {
            throw err
          });
    }
    else {
      this.newItem();
    }
  }

  newItem() {
    this.fh.setValue(new Workflow());
    this.showAddNewButton = false;
  }

  refreshCategories() {
    let qm: QueryModifier = new QueryModifier();

    qm.sortBy = "name";

    this.core.data.find(DataEntity.Category, qm)
      .subscribe((results: APIResponse<Category>) => {
        this.allCategories = results.data;
      },
        err => {
          throw err
        });
  }

  addCategory() {
    this.core.dialog.showEntityDialog(new EntityDialogConfiguration(DataEntity.Category, new Category()))
      .subscribe((dlgResults: DialogResult<Category>) => {

        if (!dlgResults.isCancel) {
          this.core.data.save(DataEntity.Category, dlgResults.value)
            .subscribe((results: APIResponse<string>) => {
              dlgResults.value._id = results.data[0];
              //Adding in this way for the On Push change detection, 
              //(See: https://github.com/ng-select/ng-select#change-detection).
              this.allCategories = [...this.allCategories, dlgResults.value];
              this.category.select({ name: dlgResults.value.name, value: dlgResults.value });
            },
              (err) => {
                throw err
              }
            );
        }
      },
        err => {
          throw err
        });
  }

  extractScriptNameAndTargetFromStatus(status: WorkflowStepComponentStatus): void {
    let step: WorkflowStep = status.step;
    let scriptId: string = this.getEntityId(step.script);

    if (scriptId && !this.scriptNames.has(scriptId)) {
      this.scriptNames.set(scriptId, status.scriptName)
    }

    if (step.targets && step.targets.length > 0) {
      this.targetNames.set(step.targets.join(), status.targetNames);
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

    this.fh.form.controls.steps.markAllAsTouched();
    this.core.dialog.showWorkflowStepDialog(new WorkflowStep())
      .subscribe((dlgResults: DialogResult<WorkflowStepComponentStatus>) => {

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
        err => {
          throw err
        });
  }

  createStepsFormArray(steps: WorkflowStep[], clearBeforeAdd: boolean = false): void {

    if (clearBeforeAdd) {
      (this.fh.form.controls.steps as FormArray).clear();
    }

    if (steps && steps.length > 0) {
      steps.forEach((step: WorkflowStep) => {
        let valuesArray = new FormArray([]);

        step.values.forEach((pv: ParameterValue) => {
          valuesArray.push(new FormGroup({
            name: new FormControl(pv.name),
            value: new FormControl(pv.value),
            nativeType: new FormControl(pv.nativeType)
          }))
        });

        //Adding the controls to the array:
        (this.fh.form.controls.steps as FormArray).push(new FormGroup({
          name: new FormControl(step.name),
          enabled: new FormControl(step.enabled),
          abortOnError: new FormControl(step.abortOnError),
          script: new FormControl(step.script),
          targets: new FormControl(step.targets),
          values: valuesArray
        }));
      })
    }
  }

  stopShowingChangeStepOrderAlert() {
    this.showChangeOrderAlert = false;
  }

  editStep(stepIndex: number) {

    this.fh.form.controls.steps.markAllAsTouched();
    this.core.dialog.showWorkflowStepDialog(this.getStep(stepIndex))
      .subscribe((dlgResults: DialogResult<WorkflowStepComponentStatus>) => {

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
        err => {
          throw err
        });
  }

  removeStep(stepIndex: number) {
    (this.fh.form.controls.steps as FormArray).removeAt(stepIndex);
    this.fh.form.controls.steps.markAllAsTouched();
    this.fh.form.controls.steps.markAsDirty();
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
    return ((this.fh.form.controls.steps as FormArray).controls[stepIndex].value as WorkflowStep);
  }

  getScriptName(stepIndex: number): string {
    let ret: string = "";
    let step = this.getStep(stepIndex);
    let scriptId: string = this.getEntityId(step.script);

    if (this.scriptNames.has(scriptId)) {
      ret = this.scriptNames.get(scriptId);
    }

    return ret;
  }

  getTargetNames(stepIndex: number): string {
    let ret: string = "";
    let step = this.getStep(stepIndex);
    let targetIds: string = (step.targets && step.targets.length > 0) ?
      step.targets.map((t) => this.getEntityId(t)).join() : "";
    if (this.targetNames.has(targetIds)) {
      ret = this.targetNames.get(targetIds).join(", ");
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
        let quotes: string = (pv.nativeType == "String") ? `"` : "";
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
    let data:any = Object.assign({}, this.fh.value);

    if (data.steps) {
      data.steps.forEach((step)  => {
        if (step.script) {
          step.script = step.script._id;
        }

        if (step.targets) {
          step.targets.forEach((target, i) => {
            step.targets[i] = target._id;
          });
        }
      });    
    }

    this.core.data.save(DataEntity.Workflow, data)
      .subscribe((results: APIResponse<string>) => {
        this.core.toaster.showSuccess("Changes have been saved succesfully.");
        this.fh.setId(results.data[0]);
        this.fh.setValue(this.fh.value) //This is the saved value now, so setting this value 
        //will allow the "Cancel" button to come back to this version.
        this.showAddNewButton = true;

        if (run) {
          //Redirecting to run page to execute the workflow:
          this.core.navigation.toRun(this.fh.getId());
        }
      },
        (err) => {
          throw err
        }
      );
  }

  resetForm() {
    this.fh.resetForm();
    
    //Sadly the form array values are not restored automatically to the previous values: 
    this.createStepsFormArray(this.fh.previousValue.steps, true);  
    
    //Also, the category is restored fine if it has a previous value, otherwise the 
    //selected values is not cleared from the dropdown, so we need to do it manually:
    if (!this.fh.previousValue.category) {
      this.category.handleClearClick();
    }    
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray((this.fh.form.controls.steps as FormArray).controls, event.previousIndex, event.currentIndex);
  }
    
  dragStarted(event: any) {
    this.isDragging = true;
  }

  dragReleased(event: any) {
    this.isDragging = false;
  }
}
