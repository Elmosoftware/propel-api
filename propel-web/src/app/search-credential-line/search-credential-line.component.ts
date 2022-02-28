import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DialogResult } from 'src/core/dialog-result';
import { SearchLineInterface } from 'src/core/search-line-interface';
import { CoreService } from 'src/services/core.service';
import { DataEntity } from 'src/services/data.service';
import { SystemHelper } from 'src/util/system-helper';
import { UIHelper } from 'src/util/ui-helper';
import { APIResponse } from '../../../../propel-shared/core/api-response';
import { Credential } from "../../../../propel-shared/models/credential";
import { CredentialTypes } from '../../../../propel-shared/models/credential-types';
import { Secret } from '../../../../propel-shared/models/secret';
import { SecretValue } from '../../../../propel-shared/models/secret-value';
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
    let ret: string = "No defined fields.";

    if (item.fields.length > 0) {
       ret = `${item.fields.length} field(s) defined.\r\n${UIHelper.getParameterValuesList(item.fields)}`;
    }   

    return ret;
  }

  getTooltipForCredentialType(item: Credential): string {
    let ret: string = "Credential type: ";

    if (Utils.testEnumKey(CredentialTypes, item.credentialType) ) {

      ret += String(Utils.getEnum(CredentialTypes)
        .find((elem) => { return elem.key == item.credentialType })
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

        //First we try t0 delete the Secret:
        this.core.data.delete(DataEntity.Secret, item.secretId)
          .subscribe((results: APIResponse<string>) => {
            //Old Secret was deleted!                      
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

    //Fetching the Secret holding the Credential secrets:
    this.core.data.getById(DataEntity.Secret, item.secretId, true)
      .subscribe((data: APIResponse<Secret<SecretValue>>) => {
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
        err => { //If There was an error loading the Secret part of the Credential:
          item["testStatus"] = TestStatus.Error;
          this.core.toaster.showError("There was an error testing the credential. Please edit the credential to see more details.",
            "Credential test error.");
        });
  }
  
  getLastUpdate(item: Credential): string {
    return UIHelper.getLastUpdateMessage(item, true)
  }

  getLastUpdateTooltip(item: Credential): string {
    return UIHelper.getLastUpdateMessage(item, false)
  }
}
