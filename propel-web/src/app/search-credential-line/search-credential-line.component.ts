import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DialogResult } from 'src/core/dialog-result';
import { SearchLine } from 'src/core/search-line';
import { CoreService } from 'src/services/core.service';
import { DataEndpointActions } from 'src/services/data.service';
import { UIHelper } from 'src/util/ui-helper';
import { APIResponse } from '../../../../propel-shared/core/api-response';
import { PropelError } from '../../../../propel-shared/core/propel-error';
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
export class SearchCredentialLineComponent extends SearchLine implements OnInit {

  @Input() model: Credential[];

  @Input() term: string;

  @Output("dataChanged") dataChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  testStatusEnum = TestStatus;
  credentialTypes = CredentialTypes;

  constructor(private core: CoreService) {
    super()
   }

  ngOnInit(): void {
  }

  goToEdit(item: Credential) {
    switch (item.credentialType) {
      case this.credentialTypes.Windows:
        this.core.navigation.toWindowsCredential(item._id)
        break;    
      case this.credentialTypes.AWS:
        this.core.navigation.toAWSCredential(item._id)
        break;    
      case this.credentialTypes.APIKey:
        this.core.navigation.toGenericAPIKeyCredential(item._id)
        break;    
      default:
        throw new PropelError(`No navigation defined to edit Credentials of type "${item.credentialType}".` )
    }
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
        this.core.data.delete(DataEndpointActions.Secret, item.secretId)
          .subscribe((results: APIResponse<string>) => {
            //Old Secret was deleted!                      
          }, err => {
            //We give our best!
          })

        //Now deleting the credential itself:
        this.core.data.delete(DataEndpointActions.Credential, item._id)
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
    this.core.data.getById(DataEndpointActions.Secret, item.secretId, true)
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
}
