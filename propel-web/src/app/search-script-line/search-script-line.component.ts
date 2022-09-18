import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { concat, from, of } from 'rxjs';

import { Script } from '../../../../propel-shared/models/script';
import { CoreService } from 'src/services/core.service';
import { StandardDialogConfiguration } from '../dialogs/standard-dialog/standard-dlg.component';
import { DialogResult } from 'src/core/dialog-result';
import { DataEndpointActions } from 'src/services/data.service';
import { APIResponse } from '../../../../propel-shared/core/api-response';
import { SearchLine } from 'src/core/search-line';
import { concatAll } from 'rxjs/operators';

@Component({
  selector: 'app-search-script-line',
  templateUrl: './search-script-line.component.html',
  styleUrls: ['./search-script-line.component.css']
})
export class SearchScriptLineComponent extends SearchLine implements OnInit {

  @Input() model: Script[];

  @Input() term: string;

  @Output("dataChanged") dataChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  get isAdmin(): boolean {
    return this.core.security.isUserLoggedIn && this.core.security.sessionData.roleIsAdmin;
  }

  constructor(private core: CoreService) {
    super();
  }

  ngOnInit(): void {
  }

  goToEditScript(id: string) {
    this.core.navigation.toScript(id);
  }

  getScriptTooltipMessage(item: Script): string {
    let ret = `This script is enabled and ready to use.`;

    if (!item.enabled) {
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

        of(
          from(this.core.data.save(DataEndpointActions.Script, item)),
          from(this.core.data.delete(DataEndpointActions.Script, item._id))
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
              this.core.toaster.showSuccess("Script deleted succesfully!");
              this.dataChanged.emit(true);
            })
      }
    },
      err => {
        this.core.handleError(err)
      });
  }
}
