import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { concat } from 'rxjs';

import { Script } from '../../../../propel-shared/models/script';
import { CoreService } from 'src/services/core.service';
import { StandardDialogConfiguration } from '../dialogs/standard-dialog/standard-dlg.component';
import { DialogResult } from 'src/core/dialog-result';
import { DataEntity } from 'src/services/data.service';
import { APIResponse } from '../../../../propel-shared/core/api-response';
import { SearchLineInterface } from 'src/core/search-line-interface';
import { UIHelper } from 'src/util/ui-helper';

@Component({
  selector: 'app-search-script-line',
  templateUrl: './search-script-line.component.html',
  styleUrls: ['./search-script-line.component.css']
})
export class SearchScriptLineComponent implements SearchLineInterface, OnInit {

  @Input() model: Script[];

  @Output("dataChanged") dataChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  get isAdmin(): boolean {
    return this.core.session.IsUserLoggedIn && this.core.session.sessionData.roleIsAdmin;
  }

  constructor(private core: CoreService) {

  }

  ngOnInit(): void {
  }

  goToEditScript(id: string) {
    this.core.navigation.toScript(id);
  }

  getScriptTooltipMessage(item: Script): string {
    let ret = `This script is enabled and ready to use.`;

    if(!item.enabled) {
      ret = `This script is now disabled. It can't be selected as part of any Workflow. 
If there is a Workflow that already have it, the step execution will be prevented.`
    }

    ret += `\r\nParameters: ${(item.parameters.length)}
Is targetting: ${(item.isTargettingServers) ? "Servers, (like Web servers, Database servers, etc.)" : "Services, (like Web services, LDAP queries to AD, etc.)"}.`;

    return ret;
  }

  remove(item: Script) {
    this.core.dialog.showConfirmDialog(new StandardDialogConfiguration(
      "Delete Script Confirmation",
      `Are you sure you want to delete the script named "<b>${item.name}</b>"? Please be aware that this operation can't be undone.`)
    ).subscribe((result: DialogResult<any>) => {
      if (!result.isCancel) {

        //Before to delete the Script, we need to disable it. In this way any existing workflow that 
        //have it attached will prevent the execution:
        item.enabled = false;

        concat(this.core.data.save(DataEntity.Script, item),
          this.core.data.delete(DataEntity.Script, item._id))
          .subscribe((results: APIResponse<string>) => {
          }, err => {
            throw err
          }, () => {
            this.core.toaster.showSuccess("Script deleted succesfully!");
            this.dataChanged.emit(true);
          })
      }
    }, err => {
      throw err
    });
  }
  
  getLastUpdate(item: Script): string {
    return UIHelper.getLastUpdateMessage(item, true)
  }

  getLastUpdateTooltip(item: Script): string {
    return UIHelper.getLastUpdateMessage(item, false)
  }
}
