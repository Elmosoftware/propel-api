import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { DataLossPreventionInterface } from 'src/core/data-loss-prevention-guard';
import { CoreService } from 'src/services/core.service';
import { WorkflowStepComponentStatus } from '../workflow-step/workflow-step.component';
import { Workflow } from '../../../../propel-shared/models/workflow';
import { DataEndpointActions } from 'src/services/data.service';

@Component({
  selector: 'app-quick-task',
  templateUrl: './quick-task.component.html',
  styleUrls: ['./quick-task.component.css']
})
export class QuickTaskComponent implements OnInit, DataLossPreventionInterface {

  status: WorkflowStepComponentStatus;
  completed: boolean = false;

  constructor(private core: CoreService, private route: ActivatedRoute) {
    this.status = new WorkflowStepComponentStatus(false, false);
  }

  ngOnInit(): void {
    this.core.setPageTitle(this.route.snapshot.data);    
  }

  change(status: WorkflowStepComponentStatus) {
    //Weird thing but sometimes we are receiving another object instead of the expected status:
    if (status instanceof WorkflowStepComponentStatus) {
      this.status = Object.assign({}, status);
    }    
  }

  dataChanged(): boolean | Observable<boolean> | Promise<boolean> {
    return this.core.dataChanged(this.status.isDirty && !this.completed);
  }

  run() {

    if (!this.status.isValid) return;

    this.core.data.save(DataEndpointActions.Workflow, this._createWorkflowFromStep(this.status))
      .then((id: string) => {
        this.completed = true;
        this.core.navigation.toRun(id);
      },
      (error) => {
        this.core.handleError(error)
      })
  }

  private _createWorkflowFromStep(status: WorkflowStepComponentStatus): Workflow {
    let ret = new Workflow();

    ret.name = status.step!.name;
    ret.isQuickTask = true;

    ret.steps.push(status.step!);

    return ret;
  }
}
