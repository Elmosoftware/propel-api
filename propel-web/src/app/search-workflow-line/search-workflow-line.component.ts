import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Workflow } from '../../../../propel-shared/models/workflow';
import { CoreService } from 'src/services/core.service';
import { APIResponse } from '../../../../propel-shared/core/api-response';
import { StandardDialogConfiguration } from '../dialogs/standard-dialog/standard-dlg.component';
import { DialogResult } from 'src/core/dialog-result';
import { DataEntity } from 'src/services/data.service';
import { Entity } from '../../../../propel-shared/models/entity';
import { SearchLine } from 'src/core/search-line';

@Component({
  selector: 'app-search-workflow-line',
  templateUrl: './search-workflow-line.component.html',
  styleUrls: ['./search-workflow-line.component.css']
})
export class SearchWorkflowLineComponent extends SearchLine implements OnInit {

  @Input() model: Workflow[];

  @Input() term: string;

  @Output("dataChanged") dataChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  get isAdmin(): boolean {
    return this.core.session.IsUserLoggedIn && this.core.session.sessionData.roleIsAdmin;
  }

  constructor(private core: CoreService) {
    super()
  }

  ngOnInit(): void {

  }

  goToEditWorkflow(id: string) {
    this.core.navigation.toWorkflow(id);
  }

  duplicate(id: string) {

    //We search for the workflow first:
    this.core.data.getById(DataEntity.Workflow, id)
      .subscribe((results: APIResponse<Entity>) => {

        if (results.count == 0) {
          this.core.toaster.showWarning("Seems like the items is gone!, maybe someone else deleted. Please double check before to retry.", "Could not find the item");
        }
        else {
          //If exists, we duplicate it:
          this.core.data.duplicate(DataEntity.Workflow, (results.data[0] as Workflow).name)
            .subscribe((results: APIResponse<string>) => {
              this.core.navigation.toWorkflow(results.data[0]);
            },
              err => {
                throw err
              });
        }
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
