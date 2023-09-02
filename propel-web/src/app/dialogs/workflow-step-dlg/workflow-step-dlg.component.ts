import { Component, OnInit, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { DialogResult } from 'src/core/dialog-result';
import { WorkflowStepComponentStatus } from 'src/app/workflow-step/workflow-step.component';
import { WorkflowStep } from '../../../../../propel-shared/models/workflow-step';

@Component({
  selector: 'app-workflow-step-dlg',
  templateUrl: './workflow-step-dlg.component.html',
  styleUrls: ['./workflow-step-dlg.component.css']
})
export class WorkflowStepDialogComponent implements OnInit {

  status: WorkflowStepComponentStatus | undefined = undefined;
  step: WorkflowStep;

  get title(): string {
    if (this.step && this.step.name) {
      return this.step.name
    }
    return "New Step"
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

  closeDlg(id: number): void {
    this.dialogRef.close(new DialogResult<any>(id, this.status));
  }

  ngOnInit(): void {
  }
}
