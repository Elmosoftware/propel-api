import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Workflow } from '../../../../propel-shared/models/workflow';
import { CoreService } from 'src/services/core.service';
import { APIResponse } from '../../../../propel-shared/core/api-response';
import { StandardDialogConfiguration } from '../dialogs/standard-dialog/standard-dlg.component';
import { DialogResult } from 'src/core/dialog-result';
import { DataEntity } from 'src/services/data.service';
import { SearchLineInterface } from 'src/core/search-line-interface';

@Component({
  selector: 'app-search-workflow-line',
  templateUrl: './search-workflow-line.component.html',
  styleUrls: ['./search-workflow-line.component.css']
})
export class SearchWorkflowLineComponent implements SearchLineInterface, OnInit {

  @Input() model: Workflow[];

  @Output("dataChanged") dataChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private core: CoreService) {

  }

  ngOnInit(): void {

  }

  goToEditWorkflow(id: string) {
    this.core.navigation.toWorkflow(id);
  }

  duplicate(name: string) {
    this.core.data.duplicateWorkflow(name)
      .subscribe((results: APIResponse<string>) => {
        this.core.navigation.toWorkflow(results.data[0]);
      },
        err => {
          throw err
        });
  }

  remove(item: Workflow) {
    this.core.dialog.showConfirmDialog(new StandardDialogConfiguration(
      "Delete Workflow Confirmation",
      `Are you sure you want to delete the workflow named "<b>${item.name}</b>"? Please be aware that this operation can't be undone.`)
    ).subscribe((result: DialogResult<any>) => {
      if (!result.isCancel) {
        this.core.data.delete(DataEntity.Workflow, item._id)
          .subscribe((results: APIResponse<string>) => {
            this.core.toaster.showSuccess("Workflow deleted succesfully!");
            this.dataChanged.emit(true);
          }, err => {
            throw err
          })
      }
    }, err => {
      throw err
    });

  }

  run(id: string) {
    this.core.navigation.toRun(id);
  }
}
