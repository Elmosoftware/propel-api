import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DialogResult } from 'src/core/dialog-result';
import { SearchLine } from 'src/core/search-line';
import { CoreService } from 'src/services/core.service';
import { SharedSystemHelper } from '../../../../propel-shared/utils/shared-system-helper';
import { UserAccount } from '../../../../propel-shared/models/user-account';
import { StandardDialogConfiguration } from '../dialogs/standard-dialog/standard-dlg.component';

@Component({
  selector: 'app-search-user-account-line',
  templateUrl: './search-user-account-line.component.html',
  styleUrls: ['./search-user-account-line.component.css']
})
export class SearchUserAccountLineComponent extends SearchLine implements OnInit {

  @Input() override model!: UserAccount[];

  @Input() override term!: string;

  @Output("dataChanged") override dataChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private core: CoreService) {
    super()
  }

  ngOnInit(): void {
  }

  goToEdit(id: string) {
    this.core.navigation.toUserAccount(id);
  }

  getTooltipMessage(user: UserAccount): string {
    let lastUpdated: string = (user.lastUpdateOn) ? SharedSystemHelper.formatDate(user.lastUpdateOn) : "never"
    let lastLogin: string = (user.lastLogin) ? SharedSystemHelper.formatDate(user.lastLogin) : "never"

    let ret: string = `User stats:
Added on: ${SharedSystemHelper.formatDate(user.createdOn!)}
Last updated on: ${lastUpdated}
Last login on: ${lastLogin}`

    return ret;
  }

  getTooltipRoleMessage(item: UserAccount): string {
    let ret: string = `With assigned role "${item.role}."`;

    if (this.userIsLocked(item)) {
      ret += `\r\nThe user is locked since ${SharedSystemHelper.getFriendlyTimeFromNow(item.lockedSince!)}.`
    }

    return ret;
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
    )
      .subscribe({
        next: async (result: DialogResult<any>) => {

          if (result.isCancel) return;

          try {
            if (locked) {
              await this.core.security.unlockUser(item._id)
            }
            else {
              await this.core.security.lockUser(item._id)
            }

            this.core.toaster.showSuccess(`User ${item.fullName} is now ${(locked) ? "locked" : "unlocked"} succesfully!`);
            this.dataChanged.emit(true);

          } catch (error) {
            this.core.handleError(error)
          }
        },
        error: (error) => {
          this.core.handleError(error)
        }
      }
      );
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
