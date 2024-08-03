import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { Validators, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';

import { CoreService } from 'src/services/core.service';
import { WorkflowSchedule, ScheduleUnit, WeekDay, MonthlyOptionOrdinal, MonthlyOptionDayOfTheMonth } from "../../../../propel-shared/models/workflow-schedule";
import { FormHandler } from "../../core/form-handler";
import { Utils } from "../../../../propel-shared/utils/utils";
import { compareEntities } from '../../../../propel-shared/models/entity';
import { ValidatorsHelper } from 'src/core/validators-helper';

@Component({
  selector: 'app-workflow-schedule',
  templateUrl: './workflow-schedule.component.html',
  styleUrls: ['./workflow-schedule.component.css']
})
export class WorkflowScheduleComponent implements OnInit, AfterViewInit {

  @ViewChild("everyUnit") scheduleUnitsDropdown!: NgSelectComponent;
  @ViewChild("weeklyOptions") weeklyOptionsDropdown!: NgSelectComponent;
  @ViewChild("monthlyOptionOrdinal") monthlyOptionOrdinalDropdown!: NgSelectComponent;
  @ViewChild("monthlyOptionDay") monthlyOptionDayDropdown!: NgSelectComponent;

  fh!: FormHandler<WorkflowSchedule>;
  allScheduleUnits: { key: string, value: string | number }[] = [];
  allWeekDays: { key: string, value: string | number }[] = [];
  allMonthlyOptionOrdinals: { key: string, value: string | number }[] = [];
  allMonthlyOptionDays: { key: string, value: string | number }[] = [];
  model!: WorkflowSchedule;
  showWeeks: boolean = true;

  constructor(private core: CoreService) {

  }

  ngOnInit(): void {
    this.model = new WorkflowSchedule();
    this.allScheduleUnits = Utils.getEnum(ScheduleUnit)
    this.allWeekDays = Utils.getEnum(WeekDay)
    this.allMonthlyOptionOrdinals = Utils.getEnum(MonthlyOptionOrdinal)
    this.allMonthlyOptionDays = [...Utils.getEnum(MonthlyOptionDayOfTheMonth), ...Utils.getEnum(WeekDay)]

    this.fh = new FormHandler("WorkflowSchedule", new UntypedFormGroup({
      enabled: new UntypedFormControl(false, []),
      isRecurrent: new UntypedFormControl(false, []),
      onlyOn: new UntypedFormControl(null, [ValidatorsHelper.notNullOrEmpty()]),
      everyAmount: new UntypedFormControl(1, [Validators.min(1), Validators.max(60)]),
      everyUnit: new UntypedFormControl(ScheduleUnit.Days, []),
      weeklyOptions: new UntypedFormControl([], [ValidatorsHelper.minItems(1)]),
      monthlyOption: new UntypedFormGroup({
        ordinal: new UntypedFormControl(MonthlyOptionOrdinal.First, []),
        day: new UntypedFormControl(MonthlyOptionDayOfTheMonth["Day of the Month"], [])
      }),
      startingAt: new UntypedFormControl("00:00", [])
    }));
  }

  ngAfterViewInit(): void {
    this.setFormValue(this.model);
  }

  /**
   * Used by the dropdowns to compare the values.
   */
  compareFn: Function = compareEntities;

  /**
   * This event is raised when the schedule get enabled or disabled.
   * @param $event State event data
   */
  onEnabledChange($event: { checked: boolean}) {
    this.changeControlsState($event.checked);
  }
  
  /**
   * This event is raised when the schedule type change.
   * @param $event Schedule type change event data.
   */
  onScheduleTypeChange($event: any) {
    setTimeout(() => {
      this.setFormValue(this.fh.value)
    });
  }

  /**
   * This event is raised when the schedule unit for a recurrent schedule is changed.
   * @param $event Schedule unit change event data.
   */
  onScheduleUnitChange($event: { key: string, value: string | number }) {
    this.fh.form.controls["monthlyOption"].enable({onlySelf: true, emitEvent:false});
    this.fh.form.controls["weeklyOptions"].enable({onlySelf: true, emitEvent:false});

    switch ($event.key) {
      case ScheduleUnit.Weeks:
        this.fh.form.controls["monthlyOption"].disable({onlySelf: true, emitEvent:false});
        break;
      case ScheduleUnit.Months:
        this.fh.form.controls["weeklyOptions"].disable({onlySelf: true, emitEvent:false});
        break;
      default:
        this.fh.form.controls["monthlyOption"].disable({onlySelf: true, emitEvent:false});
        this.fh.form.controls["weeklyOptions"].disable({onlySelf: true, emitEvent:false});
        break;
    }

    this.fh.form.controls["monthlyOption"].updateValueAndValidity();
    this.fh.form.controls["weeklyOptions"].updateValueAndValidity();
  }

  /**
   * Set the values and controls state in the form based on the provided schedule.
   * @param value Workflow schedule to set.
   */
  setFormValue(value: WorkflowSchedule) {
    this.fh.setValue(value);

    if (value.isRecurrent) {
      //For some reason when the NGSelect controls are hidden, they lost the active selection, so 
      //we need to set the selected values again: 

      //Schedule units:
      let item = this.scheduleUnitsDropdown.itemsList.items.find((item) => {
        return item.value.key == value.everyUnit
      });

      if (item) {
        this.scheduleUnitsDropdown.select(item); //Selecting the value in the dropdown.      
      }

      //Weekly options
      this.weeklyOptionsDropdown.clearModel(); //Clearing all selections.

      value.weeklyOptions.forEach((weekday: WeekDay) => {
        let item = this.weeklyOptionsDropdown.itemsList.items.find((item) => item.value.value == weekday)!
        this.weeklyOptionsDropdown.select(item);
      })

      //Monthly options ordinal:
      item = this.monthlyOptionOrdinalDropdown.itemsList.items.find((item) => {
        return item.value.key == value.monthlyOption.ordinal
      });

      if (item) {
        this.monthlyOptionOrdinalDropdown.select(item);
      }

      //Monthly options day:
      item = this.monthlyOptionDayDropdown.itemsList.items.find((item) => {
        return item.value.value == value.monthlyOption.day
      });

      if (item) {
        this.monthlyOptionDayDropdown.select(item);
      }

      this.fh.form.controls["onlyOn"].clearValidators();
      this.fh.form.controls["onlyOn"].updateValueAndValidity();
    }
    else {
      this.fh.form.controls["onlyOn"].clearValidators();
      this.fh.form.controls["onlyOn"].addValidators(ValidatorsHelper.notNullOrEmpty());
      this.fh.form.controls["onlyOn"].updateValueAndValidity();
    }

    this.fh.form.updateValueAndValidity();
    this.fh.form.markAsPristine();
    this.fh.form.markAsUntouched();

    setTimeout(() => {
      this.changeControlsState(value.enabled)
    });
  }

  /**
   * Enable or disable all the controls in the active form based on the recieved parameter value.
   * 
   * @param enabled Indicates if the controls will be enabled or not.
   */
  changeControlsState(enabled: boolean) {
    for (const controlName in this.fh.form.controls) {
      // All the controls but the "Enabled" toggle itself of course.... 
     if (controlName !== "enabled") {
       if (enabled) {
         this.fh.form.controls[controlName].enable({onlySelf: true, emitEvent:false});
       }
       else {
         this.fh.form.controls[controlName].disable({onlySelf: true, emitEvent:false});
       }
     }
   }
 }
}
