import { Component, OnInit, EventEmitter } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { DataLossPreventionInterface } from 'src/core/data-loss-prevention-guard';
import { FormHandler } from 'src/core/form-handler';
import { CoreService } from 'src/services/core.service';
import { DataEndpointActions } from 'src/services/data.service';
import { Credential } from '../../../../propel-shared/models/credential';
import { CredentialTypes, DEFAULT_CREDENTIAL_TYPE } from '../../../../propel-shared/models/credential-types';
import { Secret, SecretFactory } from "../../../../propel-shared/models/secret";
import { SecretValue } from "../../../../propel-shared/models/secret-value";
import { ValidatorsHelper } from 'src/core/validators-helper';
import { ParameterValue } from '../../../../propel-shared/models/parameter-value';
import { DialogResult } from 'src/core/dialog-result';
import { Utils } from '../../../../propel-shared/utils/utils';
import { ErrorCodes } from '../../../../propel-shared/core/error-codes';
import { FormSubcomponentEventData } from 'src/core/form-subcomponent';
import { StandardDialogConfiguration } from '../dialogs/standard-dialog/standard-dlg.component';
import { PropelError } from '../../../../propel-shared/core/propel-error';

@Component({
  selector: 'app-credential',
  templateUrl: './credential.component.html',
  styleUrls: ['./credential.component.css']
})
export class CredentialComponent implements OnInit, DataLossPreventionInterface {

  private requestCount$: EventEmitter<number>;
  fh: FormHandler<Credential>;
  loaded: boolean = false;
  reset!: Subject<void>;
  saved!: Subject<void>;
  secret!: Secret<SecretValue>;
  secretIsValid: boolean = false;
  showInformativeFieldsAlert: boolean = true;
  showMaxFieldsReachedAlert: boolean = true;
  //Form validation constant parameters:
  validationParams: any = {
    get nameMaxLength() { return 25 },
    get descriptionMaxLength() { return 512 },
    get fieldsMaxCount() { return 5 }
  }

  get fields(): UntypedFormArray {
    return (this.fh.form.controls['fields'] as UntypedFormArray);
  }

  get isValid(): boolean {
    return (this.fh.form.valid && this.secretIsValid);
  }

  constructor(private core: CoreService, private route: ActivatedRoute) {
    //Creating the Form handler with the CredentialBase fields only:
    this.fh = new FormHandler(DataEndpointActions.Credential, new UntypedFormGroup({
      name: new UntypedFormControl("", [
        Validators.required,
        Validators.maxLength(this.validationParams.nameMaxLength),
        ValidatorsHelper.pattern(new RegExp("^[a-zA-Z0-9]+$", "g"),
          "The credential name can contain only letters and numbers, any other character is invalid.")
      ]),
      description: new UntypedFormControl("", [
        Validators.maxLength(this.validationParams.descriptionMaxLength)
      ]),
      credentialType: new UntypedFormControl(DEFAULT_CREDENTIAL_TYPE),
      secretId: new UntypedFormControl(""),
      fields: new UntypedFormArray([], [
        ValidatorsHelper.maxItems(this.validationParams.fieldsMaxCount)])
    }));

    this.requestCount$ = this.core.navigation.getHttpRequestCountSubscription()
    this.requestCount$
      .subscribe(
        {
          next: (count: number) => {
            if (count > 0) {
              this.fh.form.disable({ emitEvent: false });
            }
            else {
              this.fh.form.enable({ emitEvent: false });
            }
          }
        }
      )
  }

  ngOnInit(): void {
    let id = this.route.snapshot.paramMap.get("id");

    this.core.setPageTitle(this.route.snapshot.data);
    this.reset = new Subject<void>();
    this.saved = new Subject<void>();

    //If a credential id is provided, we are getting the credential type from it, otherwise
    //we must look into the querystring parameters:
    if (!id) {
      let credentialType: any = Utils.getEnumValue(CredentialTypes,
        this.core.navigation.getCurrentPageSuffix(), false)

      if (credentialType) {
        this.fh.form.controls['credentialType'].patchValue(String(credentialType));
      }
    }
    else {
      this.fh.form.controls['_id'].patchValue(String(id));
    }

    this.refreshData()
      .catch(this.core.handleError)
  }

  dataChanged(): boolean | Observable<boolean> | Promise<boolean> {
    return this.core.dataChanged(this.fh);
  }

  secretChanged($event: FormSubcomponentEventData<any>) {
    //We must ignore the secret change when the form is resetting:
    setTimeout(() => {
      this.secret.value = $event.model;
      this.secretIsValid = $event.isValid;
      this.fh.form.updateValueAndValidity();
      this.fh.form.markAsDirty();
    }, 0);
  }

  async refreshData(): Promise<void> {
    let cred: Credential | undefined = undefined;
    let secret;

    this.loaded = false;

    if (!this.fh.form.controls['_id'].value) {
      this.newItem();
      return Promise.resolve();
    }

    try {
      cred = await this.core.data.getById(DataEndpointActions.Credential,
        this.fh.form.controls['_id'].value, true) as Credential;

      if (!cred) {
        this.core.toaster.showWarning("If you access directly with a link, maybe is broken. Go to the Browse page and try a search.", "Could not find the item")
        this.newItem();
        return Promise.resolve();
      }

      this.fh.setValue(cred);
      this._createFieldsFromArray(cred.fields, true);
      this.fh.form.updateValueAndValidity();

      secret = await this.core.data.getById(DataEndpointActions.Secret,
        this.fh.form.controls['secretId'].value, true)

      if (!secret) {
        //If the secret is missing for some reason, we must prepare the form to enter the secret 
        //part of the credential again:
        this.newItem(true);
        this._missingSecretDialog()
        return Promise.resolve()
      }

      this.secret = (secret as Secret<SecretValue>);
      this.secretIsValid = true;
      this.fh.form.controls['secretId'].patchValue(this.secret._id);
      this.fh.form.updateValueAndValidity();
      this.loaded = true;

    } catch (error) {
      let cryptoError: boolean = false;
      let e: PropelError = new PropelError(error as Error);

      cryptoError = (e.errorCode.key == ErrorCodes.CryptoError.key);

      //If the Secret exists, but there was an error decrypting it:
      if (cryptoError) {
        this.core.toaster.showError("Not able to retrieve some part of the credential information.", "Error decrypting data.")
        this.core.dialog.showConfirmDialog(new StandardDialogConfiguration("Credential information is missing",
          `<strong>We found an error decrypting this credential secret data.</strong>
This can be caused by data corruption, but most probably by unintended changes in Propel encryption keys that are set 
by the installer. This is most likely the cause if you can confirm this is happening to other credentials too.
<p class="mt-2">
You can now:
<ul>
<li>Click the <strong>Cancel</strong> button and you will be redirected to the browse page where you can 
verify if this is happening to other credentials too.</li>
<li>Click the <strong>Ok</strong> button and you will have the chance to enter again the data in 
the credential that will be saved with current encryption keys.</li>
</ul>
</p>
<p class="mt-2">
Just a final note: If this issue is not remediated, the scripts consuming this credentials are going to fail in any Quick Task or Workflow they take part.
</p>`))
          .subscribe(
            {
              next: (result: DialogResult<any>) => {
                //If the user is cancelling, we will redirect to the Browse credentials page:
                if (result.isCancel) {
                  this.core.navigation.toBrowseCredentials();
                }
                else { //If the user decide to enter the credential again.
                  //We would like to do our best effort to delete the old secret first
                  this.core.data.delete(DataEndpointActions.Secret,
                    this.fh.form.controls['secretId'].value)
                    .catch(_ => { }) //Oops!, We give our best anyway!

                  //Whatever the error is, we need to create a new secret in the form, (because the 
                  //persisted one is gone):
                  this.newItem(true);
                }
              },
              error: _ => { }
            }
          );

        return Promise.resolve();
      }
      else {
        if (!cred) {
          this.core.toaster.showError("There was an unexpected error retrieving the requested credential. Please verify if is not deleted", "Error retrieving the credential.")
          this.newItem();
        }
        else if (!secret) {
          this.newItem(true);
          this._missingSecretDialog()
          return Promise.resolve()
        }
        this.loaded = true;
        return Promise.reject(e)
      }
    }
  }

  newItem(secretOnly: boolean = false) {
    let cred: Credential = new Credential();

    this.loaded = false;
    cred.credentialType = this.fh.value.credentialType
    this.secret = SecretFactory.createFromCredential(cred);

    //If we need to create not only a Credential Secret but the whole Credentials object:
    if (!secretOnly) {
      this.fh.setValue(cred);
      this._createFieldsFromArray(cred.fields, true);
    }

    //Ensuring we are going to create a new Secret:
    //Ensuring we are going to create a new Secret:
    this.fh.form.controls['secretId'].patchValue(this.secret._id);
    this.fh.form.updateValueAndValidity();
    this.loaded = true;
  }

  addField() {
    this.fh.form.controls['fields'].markAllAsTouched();
    this.core.dialog.showCustomFieldDialog(new ParameterValue())
      .subscribe(
        {
          next: (dlgResults: DialogResult<ParameterValue>) => {

            if (!dlgResults.isCancel) {

              let pv: ParameterValue = dlgResults.value;

              if (pv) {
                //We need to ensure the field is unique:
                if (this._fieldIsUnique(this.fh.value.fields, pv.name)) {
                  this._createFieldsFromArray([pv], false);
                  this.fh.form.updateValueAndValidity();
                  this.fh.form.markAsDirty();
                }
                else {
                  this.core.toaster.showWarning("The field name supplied is already in use. Be aware that field names are case insensitive and must be unique.", "Duplicated field")
                }
              }
            }
          },
          error: (error) => {
            this.core.handleError(error)
          }
        }
      );
  }

  removeField(i: number) {
    (this.fh.form.controls['fields'] as UntypedFormArray).removeAt(i);
    this.fh.form.controls['fields'].markAllAsTouched();
    this.fh.form.controls['fields'].markAsDirty();
  }

  editField(i: number) {

    this.fh.form.controls['fields'].markAllAsTouched();
    this.core.dialog.showCustomFieldDialog(this._getCustomField(i))
      .subscribe({
        next: (dlgResults: DialogResult<ParameterValue>) => {
          if (!dlgResults.isCancel) {

            let pv: ParameterValue = dlgResults.value;

            if (pv) {
              let allFields: ParameterValue[] = this.fh.value.fields;

              //We need to ensure the field keeps being unique:
              if (this._fieldIsUnique(allFields, pv.name, i)) {
                allFields[i] = pv;
                this._createFieldsFromArray(allFields, true);
                this.fh.form.updateValueAndValidity();
                this.fh.form.markAsDirty();
              }
              else {
                this.core.toaster.showWarning("The field name supplied is already in use. Be aware that field names are case insensitive and must be unique.", "Duplicated field")
              }
            }
          }
        },
        error: (error) => {
          this.core.handleError(error)
        }
      }
      );
  }

  getResetObservable(): Observable<void> {
    return this.reset.asObservable();
  }

  getSavedObservable(): Observable<void> {
    return this.saved.asObservable();
  }

  resetForm() {
    if (this.fh.previousValue) {
      this.reset.next(); //Indicating to sub forms that the data was resetted.
      this._createFieldsFromArray(this.fh.previousValue.fields, true);
      this.fh.resetForm();
    }
  }

  stopShowingInformativeFieldsAlert(): void {
    this.showInformativeFieldsAlert = false;
  }

  stopShowingMaxFieldsReachedAlert(): void {
    this.showMaxFieldsReachedAlert = false;
  }

  save(): void {
    this.internalSave()
      .catch((error) => {
        this.core.handleError(error)
      })
  }

  private async internalSave(): Promise<void> {
    let secretId: string;
    let credentialId: string;

    try {

      secretId = await this.core.data.save(DataEndpointActions.Secret, this.secret)

      //Updating the secret id in the credential:
      this.fh.form.controls['secretId'].patchValue(secretId);

      //Now we save the credential:
      credentialId = await this.core.data.save(DataEndpointActions.Credential, this.fh.value)

      this.core.toaster.showSuccess("Changes have been saved succesfully.");
      this.fh.setId(credentialId);
      this.fh.setValue(this.fh.value) //This is the saved value now, so setting this value 
      //will allow the "Cancel" button to come back to this version.
      this.fh.form.markAsPristine();
      this.fh.form.markAsUntouched();

      //Signaling the inner component to indicate the data was saved:
      this.secret._id = this.fh.value.secretId;
      this.saved.next();

      //Replacing in the navigation history the URL so when the user navigate back 
      //and if we are creating an item it will edit the created item instead of showing 
      //a new item form:
      this.core.navigation.replaceHistory(this.fh.getId());

      return Promise.resolve();

    } catch (error) {

      //If there was an error trying to save the Credential and is a new credential,
      //we need to try to remove the Secret that was already saved in the previous
      //step:
      if (!this.fh.value._id) {
        this.core.data.delete(DataEndpointActions.Secret, this.fh.value.secretId)
          .catch(_ => { }) //We did our best to delete it.

        //Removing the Id from the credential:
        //Removing the Id from the credential:
        this.fh.form.controls['secretId'].patchValue("");
      }

      return Promise.reject(error)
    }
  }

  /**
   * 
   * @param fields ParameterValue collection
   * @param name Name of a new field or the updated name of an existing field.
   * @param currentIndex the index of the field. If we are adding a new field, the value must be -1.
   * @returns A boolean value indicating if the field name is unique in the collection of 
   * ParameterValues supplied.
   */
  private _fieldIsUnique(fields: ParameterValue[], name: string, currentIndex: number = -1): boolean {
    let duplicated: boolean = fields.some((pv, i) => {
      return i !== currentIndex && (pv.name.toLowerCase() == name.toLowerCase());
    })

    return !duplicated;
  }

  private _createFieldsFromArray(fields: ParameterValue[], clearBeforeAdd: boolean = false): void {

    if (clearBeforeAdd) {
      (this.fh.form.controls['fields'] as UntypedFormArray).clear();
    }

    if (fields && fields.length > 0) {
      fields.forEach((field: ParameterValue) => {
        //Adding the controls to the array:
        (this.fh.form.controls['fields'] as UntypedFormArray).push(new UntypedFormGroup({
          name: new UntypedFormControl(field.name),
          value: new UntypedFormControl(field.value),
          nativeType: new UntypedFormControl(field.nativeType)
        }));
      })
    }
  }

  private _getCustomField(index: number): ParameterValue {
    return ((this.fh.form.controls['fields'] as UntypedFormArray).controls[index].value as ParameterValue);
  }

  private _missingSecretDialog(): void {
    this.core.dialog.showConfirmDialog(new StandardDialogConfiguration("Credential information is missing",
      `The secret part of the credential is missing! This could happen as a result of a database 
migration or data corruption.
<p class="mt-2 mb-0">To prevent dependent PowerShell scripts from failing, you must re-enter the 
missing sensitive data in the form again.</p>`))
      .subscribe({
        next: _ => { },
        error: _ => { }
      }
      );
  }
}
