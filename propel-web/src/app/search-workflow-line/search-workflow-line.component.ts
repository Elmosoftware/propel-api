import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Workflow } from '../../../../propel-shared/models/workflow';
import { CoreService } from 'src/services/core.service';
import { StandardDialogConfiguration } from '../dialogs/standard-dialog/standard-dlg.component';
import { DialogResult } from 'src/core/dialog-result';
import { DataEndpointActions } from 'src/services/data.service';
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
    return this.core.security.isUserLoggedIn && this.core.security.sessionData.roleIsAdmin;
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
    this.core.data.getById(DataEndpointActions.Workflow, id)
      .then((workflow: Workflow) => {

        if (!workflow) {
          this.core.toaster.showWarning("Seems like the items is gone!, maybe someone else deleted. Please double check before to retry.", "Could not find the item");
        }
        else {
          //If exists, we duplicate it:
          this.core.data.duplicate(DataEndpointActions.Workflow, workflow.name)
            .then((dupId: string) => {
              this.core.navigation.toWorkflow(dupId);
            },
              (error) => {
                this.core.handleError(error)
              });
        }
      },
        (error) => {
          this.core.handleError(error)
        });
  }

  remove(item: Workflow) {
    this.core.dialog.showConfirmDialog(new StandardDialogConfiguration(
      "Delete Workflow Confirmation",
      `Are you sure you want to delete the workflow named "<b>${item.name}</b>"? Please be aware that this operation can't be undone.`)
    ).subscribe((result: DialogResult<any>) => {
      if (!result.isCancel) {
        this.core.data.delete(DataEndpointActions.Workflow, item._id)
          .then((id: string) => {
            this.core.toaster.showSuccess("Workflow deleted succesfully!");
            this.dataChanged.emit(true);
          },
            (error) => {
              this.core.handleError(error)
            })
      }
    },
      (error) => {
        this.core.handleError(error)
      });
  }

  run(id: string) {
    this.core.navigation.toRun(id);
  }
}
