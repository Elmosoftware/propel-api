import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DialogResult } from 'src/core/dialog-result';
import { SearchLineInterface } from 'src/core/search-line-interface';
import { CoreService } from 'src/services/core.service';
import { DataEntity } from 'src/services/data.service';
import { SystemHelper } from 'src/util/system-helper';
import { APIResponse } from '../../../../propel-shared/core/api-response';
import { Credential } from "../../../../propel-shared/models/credential";
import { CredentialTypes } from '../../../../propel-shared/models/credential-types';
import { Vault } from '../../../../propel-shared/models/vault';
import { Utils } from '../../../../propel-shared/utils/utils';
import { StandardDialogConfiguration } from '../dialogs/standard-dialog/standard-dlg.component';

export enum TestStatus {
  NotTested = 0,
  Ok = 1,
  Error = 2
}

@Component({
  selector: 'app-search-credential-line',
  templateUrl: './search-credential-line.component.html',
  styleUrls: ['./search-credential-line.component.css']
})
export class SearchCredentialLineComponent implements SearchLineInterface, OnInit {

  @Input() model: Credential[];

  @Output("dataChanged") dataChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  testStatusEnum = TestStatus;
  credentialTypes = CredentialTypes;

  constructor(private core: CoreService) { }

  ngOnInit(): void {
  }

  goToEdit(id: string) {
    this.core.navigation.toCredential(id);
  }

  getTooltipMessage(item: Credential): string {
    let ret: string = "";
    let lastUpdate: Date = (item.lastUpdateOn) ? item.lastUpdateOn : item.createdOn;

    ret = `Last modification: ${SystemHelper.getFriendlyTimeFromNow(lastUpdate)}, (${SystemHelper.formatDate(lastUpdate)})
Fields: ${(item.fields.length > 0) ? `${item.fields.length} field(s) defined.` : "No defined fields."}`;

    return ret;
  }

  getTooltipForCredentialType(item: Credential): string {
    let ret: string = "Credential type: ";

    if (Utils.testEnumKey(CredentialTypes, item.type) ) {

      ret += String(Utils.getEnum(CredentialTypes)
        .find((elem) => { return elem.key == item.type })
        .value)
    }

    return ret;
  }

  getTestStatusMessage(item: Credential): string {

    let ret: string = "Not tested";

    if (item["testStatus"] == undefined) {
      item["testStatus"] = TestStatus.NotTested;
    }

    switch (item["testStatus"]) {
      case TestStatus.Ok:
        ret = "Credential is Ok!"
        break;
      case TestStatus.Error:
        ret = "Test Error"
        break;
    }

    return ret;
  }

  remove(item: Credential) {
    this.core.dialog.showConfirmDialog(new StandardDialogConfiguration(
      "Delete Credential Confirmation",
      `Are you sure you want to delete the credential named "<b>${item.name}</b>"? Please be aware that this operation can't be undone.
Also: This can cause to fail any script that is currently using the credential.`)
    ).subscribe((result: DialogResult<any>) => {
      if (!result.isCancel) {

        //First we try t delete the vault item:
        this.core.data.delete(DataEntity.Vault, item.vaultId)
          .subscribe((results: APIResponse<string>) => {
            //Old Vault item id was deleted!                      
          }, err => {
            //We give our best!
          })

        //Now deleting the credential itself:
        this.core.data.delete(DataEntity.Credential, item._id)
          .subscribe((results: APIResponse<string>) => {
            this.core.toaster.showSuccess("The credential was deleted succesfully!");
            this.dataChanged.emit(true);
          }, err => {
            throw err
          })
      }
    }, err => {
      throw err
    });
  }

  test(item: Credential) {

    //Adding the status to the credential:
    if (item["testStatus"] == undefined) {
      item["testStatus"] = TestStatus.NotTested
    }

    //Fetching the Vault item holding the credential secrets:
    this.core.data.getById(DataEntity.Vault, item.vaultId, true)
      .subscribe((data: APIResponse<Vault<any>>) => {
        if (data.count == 0) {
          //If the secret is missing:
          item["testStatus"] = TestStatus.Error;
          this.core.toaster.showError("There was an error testing the credential. Please edit the credential to see more details.",
            "Credential test error.");
        }
        else {
          //The secret is accessible:
          item["testStatus"] = TestStatus.Ok;
          this.core.toaster.showSuccess(`Credential "${item.name}" is healthy!`, "Succesful Credential test")
        }
      },
        err => { //If There was an error loading the Vault item:
          item["testStatus"] = TestStatus.Error;
          this.core.toaster.showError("There was an error testing the credential. Please edit the credential to see more details.",
            "Credential test error.");
        });
  }
}
