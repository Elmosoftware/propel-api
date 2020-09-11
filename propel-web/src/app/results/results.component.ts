import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatAccordion } from '@angular/material/expansion';

import { ExecutionLog } from '../../../../propel-shared/models/execution-log';
import { CoreService } from 'src/services/core.service';
import { APIResponse } from '../../../../propel-shared/core/api-response';
import { SystemHelper } from 'src/util/system-helper';
import { ExecutionStep } from '../../../../propel-shared/models/execution-step';
import { UIHelper } from 'src/util/ui-helper';
import { ExecutionTarget } from '../../../../propel-shared/models/execution-target';
import { Utils } from '../../../../propel-shared/utils/utils';
import { ExecutionError } from '../../../../propel-shared/models/execution-error';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements OnInit {

  @ViewChild(MatAccordion) accordion: MatAccordion;

  log: ExecutionLog;
  executionResults: Map<string, any>
  allErrors: any[];
  collapseStatus: boolean | null = null;
  showGrouped: boolean = true;

  constructor(private core: CoreService, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.executionResults = new Map<string, any>();
    this.allErrors = [];
    this.refreshData();
  }

  refreshData() {
    let id: string = this.route.snapshot.paramMap.get("id");

    this.core.data.getById(ExecutionLog, id, true)
      .subscribe((data: APIResponse<ExecutionLog>) => {
        if (data.count == 0) {
          this.core.toaster.showWarning("If you access directly with a link, maybe is broken. Go to the Browse page and try a search.", "Could not find the item")
        }
        else {
          this.log = data.data[0];
          this.collapseStatus = (this.log.executionSteps.length == 1) ? false : null;
          this.parseResults();
        }
      },
        err => {
          throw err
        });
  }

  private buildResultskey(step: ExecutionStep, target?: ExecutionTarget): string {
    return `${step.stepName}${(target) ? target.FQDN : ""}`;
  }

  getResults(step: ExecutionStep, target?: ExecutionTarget): any {
    return this.executionResults.get(this.buildResultskey(step, target));
  }

  setResults(step: ExecutionStep, target?: ExecutionTarget, value?: any): void {
    this.executionResults.set(this.buildResultskey(step, target), value);
  }

  parseResults(): void {

    this.log.executionSteps.forEach((step: ExecutionStep) => {
      let stepData: any[] = [];

      step.targets.forEach((target: ExecutionTarget) => {

        let results: any[] =  this.parseTargetResults(target.execResults);

        //Now assing the same results to the ungrouped view:
        if (results && results.length > 0) {
          results.forEach((item) => {
            let dataItem: any;

            if (typeof item == "object") {
              dataItem = Object.assign({}, item);
            }
            else {
              dataItem = {
                data: item
              }
            }

            dataItem["Target Name"] = target.name;
            stepData.push(dataItem);
          })
        }

        this.setResults(step, target, results);

        //Adding the errors, (if any), to the ungrouped error list:
        target.execErrors.forEach((value: ExecutionError) => {
          let e = Object.assign({}, value);
          e["Target Name"] = target.name;
          this.allErrors.push(e);
        })
      });
      this.setResults(step, null, stepData);
      stepData = [];
    })
  }

  parseTargetResults(rawData: string): any[] {
      let ret: any[] = [];
      let isEmpty: boolean = true;
  
      if (!rawData) return ret;
  
      if (Utils.isValidJSON(rawData)) {
        ret = JSON.parse(rawData);
  
        if (!Array.isArray(ret)) {
          ret = [ret];
        }
  
        isEmpty = ret.length == 0 || Utils.isEmptyObject(ret[0]);
      }
      else {
        ret.push(rawData);
        isEmpty = false;
      }

      if (isEmpty) {
        ret = [];
      }

      return ret;
  }

  getWorkflowDescription() {
    let ret: string = ""

    if (this.log) {
      ret = `${this.log.workflow.name}:\n${this.log.workflow.description}`
    }

    return ret;
  }

  getDurationDetails(friendly: boolean = true) {
    let ret: string = ""

    if (this.log) {
      if (friendly) {
        ret = `Ran ${SystemHelper.getFriendlyTimeFromNow(this.log.startedAt)} and took ${SystemHelper.getFriendlyDuration(this.log.startedAt, this.log.endedAt)} to finish.`
      }
      else {
        ret = `Start at: ${SystemHelper.formatDate(this.log.startedAt)}
End at: ${SystemHelper.formatDate(this.log.endedAt)}
Total duration: ${SystemHelper.getDuration(this.log.startedAt, this.log.endedAt)}.`
      }
    }

    return ret;
  }

  getStepDetails(i: number): string {
    let ret: string = "";

    if (this.log) {
      let step: ExecutionStep = this.log.executionSteps[i];

      ret = `Script: "${step.scriptName}".
Targets: ${UIHelper.getTargetList(step)}.
Parameters: ${UIHelper.getParameterValuesList(step.values)}.`
    }

    return ret;
  }

  runAgain() {
    this.core.navigation.toRun(this.log.workflow._id);
  }

  expandAll() {
    this.accordion.openAll();
    this.collapseStatus = false;
  }

  collapseAll() {
    this.accordion.closeAll();
    this.collapseStatus = true;
  }

  groupbyStepAnTargetView() {
    this.showGrouped = true; 
  }

  groupbyStepView() {
    this.showGrouped = false; 
  }
}
