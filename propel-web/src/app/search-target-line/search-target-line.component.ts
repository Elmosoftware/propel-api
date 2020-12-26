import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { concat } from 'rxjs';

import { Target } from '../../../../propel-shared/models/target';
import { CoreService } from 'src/services/core.service';
import { DataEntity } from 'src/services/data.service';
import { APIResponse } from '../../../../propel-shared/core/api-response';
import { SearchLineInterface } from 'src/core/search-line-interface';
import { StandardDialogConfiguration } from '../dialogs/standard-dialog/standard-dlg.component';
import { DialogResult } from 'src/core/dialog-result';

@Component({
  selector: 'app-search-target-line',
  templateUrl: './search-target-line.component.html',
  styleUrls: ['./search-target-line.component.css']
})
export class SearchTargetLineComponent implements SearchLineInterface, OnInit {

  @Input() model: Target[];

  @Output("dataChanged") dataChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private core: CoreService) {
  }

  ngOnInit(): void {
  }

  goToEditTarget(id: string) {
    this.core.navigation.toTarget(id);
  }

  getTargetTooltipMessage(item: Target): string {
    let ret = `This target is enabled and ready to use.`;

    if(!item.enabled) {
      ret = `This target is now disabled. It can't be selected as a target for any Workflow. 
If there is a Workflow that already have it, the execution on this target will be prevented.`
    }

    ret += `\r\nFQDN:"${item.FQDN}".`;

    return ret;
  }

  duplicate(name: string) {
    this.core.data.duplicate(DataEntity.Target, name)
      .subscribe((results: APIResponse<string>) => {
        this.core.navigation.toTarget(results.data[0]);
      },
        err => {
          throw err
        });
  }

  remove(item: Target) {
    this.core.dialog.showConfirmDialog(new StandardDialogConfiguration(
      "Delete Target Confirmation",
      `Are you sure you want to delete the target named "<b>${item.friendlyName}</b>"? Please be aware that this operation can't be undone.`)
    ).subscribe((result: DialogResult<any>) => {
      if (!result.isCancel) {

        //Before to delete the Target, we need to disable it. In this way any existing workflow that 
        //have it attached will prevent the execution:
        item.enabled = false;

        concat(this.core.data.save(DataEntity.Target, item),
          this.core.data.delete(DataEntity.Target, item._id))
          .subscribe((results: APIResponse<string>) => {
          }, err => {
            throw err
          }, () => {
            this.core.toaster.showSuccess("Target deleted succesfully!");
            this.dataChanged.emit(true);
          })
      }
    }, err => {
      throw err
    });
  }
}
