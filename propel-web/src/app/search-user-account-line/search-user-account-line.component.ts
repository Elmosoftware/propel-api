import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { DialogResult } from 'src/core/dialog-result';
import { SearchLineInterface } from 'src/core/search-line-interface';
import { CoreService } from 'src/services/core.service';
import { SystemHelper } from 'src/util/system-helper';
import { UIHelper } from 'src/util/ui-helper';
import { APIResponse } from '../../../../propel-shared/core/api-response';
import { UserRegistrationResponse } from '../../../../propel-shared/core/user-registration-response';
import { UserAccount } from '../../../../propel-shared/models/user-account';
import { StandardDialogConfiguration } from '../dialogs/standard-dialog/standard-dlg.component';

@Component({
  selector: 'app-search-user-account-line',
  templateUrl: './search-user-account-line.component.html',
  styleUrls: ['./search-user-account-line.component.css']
})
export class SearchUserAccountLineComponent implements SearchLineInterface, OnInit {

  @Input() model: UserAccount[];
  @Output("dataChanged") dataChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private core: CoreService) { }

  ngOnInit(): void {
  }

  goToEdit(id: string) {
    this.core.navigation.toUserAccount(id);
  }

  getTooltipMessage(user: UserAccount): string {
    let lastUpdated: string = (user.lastUpdateOn) ? SystemHelper.formatDate(user.lastUpdateOn) : "never"
    let lastPasswordChange: string = (user.lastPasswordChange) ? SystemHelper.formatDate(user.lastPasswordChange) : "never"
    let lastLogin: string = (user.lastLogin) ? SystemHelper.formatDate(user.lastLogin) : "never"

    let ret: string = `User stats:
Added on: ${SystemHelper.formatDate(user.createdOn)}
Last updated on: ${lastUpdated}
Last password change: ${lastPasswordChange}
Last login on: ${lastLogin}
User must reset password on next login: ${(user.mustReset) ? "Yes" : "No"}`

    return ret;
  }

  getTooltipRoleMessage(item: UserAccount): string {
    let ret: string = `With assigned role "${item.role}."`;

    if (this.userIsLocked(item)) {
      ret += `\r\nThe user is locked since ${SystemHelper.getFriendlyTimeFromNow(item.lockedSince)}.`
    }

    return ret;
  }

  resetPassword(item: UserAccount): void {
    this.core.dialog.showConfirmDialog(new StandardDialogConfiguration(
      "Reset user password",
      `By resetting the user password, <i>${item.fullName}</i> will be forced to set a new password on next login. 
      <b>Are you ok to continue?</b>"<br>Please be aware that this operation can't be undone.`)
    ).subscribe(async (result: DialogResult<any>) => {

      if (!result.isCancel) {
        this.core.security.resetPassword(item._id)
          .subscribe((results: APIResponse<UserRegistrationResponse>) => {
            let result: UserRegistrationResponse = results.data[0];
            this.core.toaster.showSuccess("Password was reseted succesfully!");
            (item as any).authCode = result.authCode;
            // this.dataChanged.emit(true);
          },
            (err) => {
              throw err
            });
      }
    }, err => {
      throw err
    });
  }

  getAuthCode(item: UserAccount): string {
    if((item as any).authCode) return (item as any).authCode;
    else return "" 
  }

  toggleLockUser(item: UserAccount): void {
    let msg: string = "";
    let title: string = "";
    let locked: boolean = this.userIsLocked(item);

    if (locked) {
      title = "Unlocking the user"
      msg = `If you unlock this user account, <i>${item.fullName}</i> will be able to perform a system login in Propel.`
    }
    else {
      title = "Locking the user"
      msg = `If you lock this user account, <i>${item.fullName}</i> will not be able to use Propel util it gets unlocked.`
    }

    title += ` ${item.fullName} (${item.name})`
    msg += " <b>Are you ok to continue?</b>"

    this.core.dialog.showConfirmDialog(new StandardDialogConfiguration(title, msg)
    ).subscribe(async (result: DialogResult<any>) => {
      if (!result.isCancel) {
        let $obs: Observable<APIResponse<string>>;

        if (locked) {
          $obs = this.core.security.unlockUser(item._id)
        }
        else {
          $obs = this.core.security.lockUser(item._id)
        }

        $obs.subscribe((results: APIResponse<string>) => {
          this.core.toaster.showSuccess(`User ${item.fullName} was ${(locked) ? "locked" : "unlocked"} succesfully!`);
          this.dataChanged.emit(true);
        },
          (err) => {
            throw err
          });
      }
    }, err => {
      throw err
    });
  }

  getUserStats(item: UserAccount): string {
    return UIHelper.getLastUpdateMessage(item, true);
  }

  userIsAdmin(item: UserAccount): boolean {
    return this.core.security.userIsAdmin(item);
  }

  userIsLocked(item: UserAccount): boolean {
    return this.core.security.userIsLocked(item)
  }

  getToggleLockUserButtonName(item: UserAccount): string {
    if (this.userIsLocked(item)) return "Unlock"
    return "Lock";
  }
}
