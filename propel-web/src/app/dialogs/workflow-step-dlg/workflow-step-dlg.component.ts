import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DialogResult } from 'src/core/dialog-result';
import { WorkflowStepComponentStatus } from 'src/app/workflow-step/workflow-step.component';
import { WorkflowStep } from '../../../../../propel-shared/models/workflow-step';

@Component({
  selector: 'app-workflow-step-dlg',
  templateUrl: './workflow-step-dlg.component.html',
  styleUrls: ['./workflow-step-dlg.component.css']
})
export class WorkflowStepDialogComponent implements OnInit {

  status: WorkflowStepComponentStatus = null;
  step: WorkflowStep;

  get title(): string {
    return "New Step"
    // return ((this.fh.getId()) ? "Editing" : "New") + " " + this.entityName;
  }

  constructor(public dialogRef: MatDialogRef<WorkflowStep>,
    @Inject(MAT_DIALOG_DATA) public config: any) {
      this.step = config;
  }

  change(status: WorkflowStepComponentStatus) {
    //Weird thing but sometimes we are receiving another object instead of the expected status:
    if (status instanceof WorkflowStepComponentStatus) {
      this.status = Object.assign({}, status);
    }    
  }

  closeDlg(id): void {
    this.dialogRef.close(new DialogResult<any>(id, this.status));
  }

  ngOnInit(): void {
  }
}
