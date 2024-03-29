import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DialogResult } from 'src/core/dialog-result';
import { SearchLine } from 'src/core/search-line';
import { CoreService } from 'src/services/core.service';
import { DataEndpointActions } from 'src/services/data.service';
import { UIHelper } from 'src/util/ui-helper';
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

  @Input() override model!: Credential[];

  @Input() override term!: string;

  @Output("dataChanged") override dataChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

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
      case this.credentialTypes.Database:
        this.core.navigation.toDatabaseCredential(item._id)
        break;
      default:
        throw new PropelError(`No navigation defined to edit Credentials of type "${item.credentialType}".`)
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

    if (Utils.testEnumKey(CredentialTypes, item.credentialType)) {
      ret += String(Utils.getEnum(CredentialTypes)
        .find((elem) => { return elem.key == item.credentialType })!
        .value)
    }

    return ret;
  }

  getTestStatusMessage(item: Credential): string {

    let ret: string = "Not tested";

    if ((item as any)["testStatus"] == undefined) {
      (item as any)["testStatus"] = TestStatus.NotTested;
    }

    switch ((item as any)["testStatus"]) {
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
    ).subscribe({
      next: (result: DialogResult<any>) => {
        if (!result.isCancel) {

          //First we try to delete the Secret:
          this.core.data.delete(DataEndpointActions.Secret, item.secretId)
            .then(_ => {
              //Old Secret was deleted!                      
            }, _ => {
              //We give our best!
            })

          //Now deleting the credential itself:
          this.core.data.delete(DataEndpointActions.Credential, item._id)
            .then(_ => {
              this.core.toaster.showSuccess("The credential was deleted succesfully!");
              this.dataChanged.emit(true);
            }, (error) => {
              this.core.handleError(error)
            })
        }
      },
      error: err => {
        this.core.handleError(err)
      }
    });
  }

  test(item: Credential) {

    //Adding the status to the credential:
    if ((item as any)["testStatus"] == undefined) {
      (item as any)["testStatus"] = TestStatus.NotTested
    }

    //Fetching the Secret holding the Credential secrets:
    this.core.data.getById(DataEndpointActions.Secret, item.secretId, true)
      .then((data) => {
        if (!data) {
          //If the secret is missing:
          (item as any)["testStatus"] = TestStatus.Error;
          this.core.toaster.showError("There was an error testing the credential. Please edit the credential to see more details.",
            "Credential test error.");
        }
        else {
          //The secret is accessible:
          (item as any)["testStatus"] = TestStatus.Ok;
          this.core.toaster.showSuccess(`Credential "${item.name}" is healthy!`, "Succesful Credential test")
        }
      },
        (error) => { //If There was an error loading the Secret part of the Credential:
          (item as any)["testStatus"] = TestStatus.Error;
          this.core.toaster.showError("There was an error testing the credential. Please edit the credential to see more details.",
            "Credential test error.");
        });
  }
}
