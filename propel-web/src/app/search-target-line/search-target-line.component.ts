import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { from, of } from 'rxjs';

import { Target } from '../../../../propel-shared/models/target';
import { CoreService } from 'src/services/core.service';
import { DataEndpointActions } from 'src/services/data.service';
import { StandardDialogConfiguration } from '../dialogs/standard-dialog/standard-dlg.component';
import { DialogResult } from 'src/core/dialog-result';
import { SearchLine } from 'src/core/search-line';
import { concatAll } from 'rxjs/operators';

@Component({
  selector: 'app-search-target-line',
  templateUrl: './search-target-line.component.html',
  styleUrls: ['./search-target-line.component.css']
})
export class SearchTargetLineComponent extends SearchLine implements OnInit {

  @Input() override model!: Target[];

  @Input() override term!: string;

  @Output("dataChanged") override dataChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  get isAdmin(): boolean {
    return this.core.security.isUserLoggedIn && this.core.security.sessionData.roleIsAdmin;
  }

  constructor(private core: CoreService) {
    super();
  }

  ngOnInit(): void {
  }

  goToEditTarget(id: string) {
    this.core.navigation.toTarget(id);
  }

  getTargetTooltipMessage(item: Target): string {
    let ret = `This target is enabled and ready to use.`;

    if (!item.enabled) {
      ret = `This target is now disabled. It can't be selected as a target for any Workflow. 
If there is a Workflow that already have it, the execution on this target will be prevented.`
    }

    ret += `\r\nFQDN:"${item.FQDN}".`;

    return ret;
  }

  duplicate(id: string) {
    //We search for the target first:
    this.core.data.getById<Target>(DataEndpointActions.Target, id)
      .then((target: Target | undefined) => {

        if (!target) {
          this.core.toaster.showWarning("Seems like the items is gone!, maybe someone else deleted. Please double check before to retry.", "Could not find the item");
        }
        else {
          //If exists, we duplicate it:
          this.core.data.duplicate(DataEndpointActions.Target, target.FQDN)
            .then((dupId: string) => {
              this.core.navigation.toTarget(dupId);
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

  remove(item: Target) {
    this.core.dialog.showConfirmDialog(new StandardDialogConfiguration(
      "Delete Target Confirmation",
      `Are you sure you want to delete the target named "<b>${item.friendlyName}</b>"? Please be aware that this operation can't be undone.`)
    )
      .subscribe((result: DialogResult<any>) => {
        if (!result.isCancel) {

          //Before to delete the Target, we need to disable it. In this way any existing workflow that 
          //have it attached will prevent the execution:
          item.enabled = false;

          of(
            from(this.core.data.save(DataEndpointActions.Target, item)),
            from(this.core.data.delete(DataEndpointActions.Target, item._id))
          )
            .pipe(
              concatAll()
            )
            .subscribe(
              _ => { },
              (error) => {
                this.core.handleError(error)
              },
              () => {
                this.core.toaster.showSuccess("Target deleted succesfully!");
                this.dataChanged.emit(true);
              })
        }
      },
        (error) => {
          this.core.handleError(error)
        });
  }
}
