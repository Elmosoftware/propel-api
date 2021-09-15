import { Component, OnInit, EventEmitter } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { DataLossPreventionInterface } from 'src/core/data-loss-prevention-guard';
import { FormHandler } from 'src/core/form-handler';
import { CoreService } from 'src/services/core.service';
import { DataEntity } from 'src/services/data.service';
import { APIResponse } from '../../../../propel-shared/core/api-response';
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

@Component({
  selector: 'app-credential',
  templateUrl: './credential.component.html',
  styleUrls: ['./credential.component.css']
})
export class CredentialComponent implements OnInit, DataLossPreventionInterface {

  private requestCount$: EventEmitter<number>;
  fh: FormHandler<Credential>;
  loaded: boolean = false;
  reset: Subject<void>;
  saved: Subject<void>;
  secret: Secret<SecretValue> = null;
  secretIsValid: boolean = false;
  showInformativeFieldsAlert: boolean = true;
  showMaxFieldsReachedAlert: boolean = true;
  //Form validation constant parameters:
  validationParams: any = {
    get nameMaxLength() { return 25 },
    get descriptionMaxLength() { return 512 },
    get fieldsMaxCount() { return 5 }
  }

  get fields(): FormArray {
    return (this.fh.form.controls.fields as FormArray);
  }

  get isValid(): boolean {
    return (this.fh.form.valid && this.secretIsValid);
  }

  constructor(private core: CoreService, private route: ActivatedRoute) {
    //Creating the Form handler with the CredentialBase fields only:
    this.fh = new FormHandler(DataEntity.Credential, new FormGroup({
      name: new FormControl("", [
        Validators.required,
        Validators.maxLength(this.validationParams.nameMaxLength),
        ValidatorsHelper.pattern(new RegExp("^[a-zA-Z0-9]+$", "g"),
          "The credential name can contain only letters and numbers, any other character is invalid.")
      ]),
      description: new FormControl("", [
        Validators.maxLength(this.validationParams.descriptionMaxLength)
      ]),
      credentialType: new FormControl(DEFAULT_CREDENTIAL_TYPE),
      secretId: new FormControl(""), 
      fields: new FormArray([], [
        ValidatorsHelper.maxItems(this.validationParams.fieldsMaxCount)])
    }));

    this.requestCount$ = this.core.navigation.getHttpRequestCountSubscription()
    this.requestCount$
      .subscribe((count: number) => {
        if (count > 0) {
          this.fh.form.disable({ emitEvent: false });
        }
        else {
          this.fh.form.enable({ emitEvent: false });
        }
      })
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
        this.fh.form.controls.credentialType.patchValue(String(credentialType));
      }
    }
    else {
      this.fh.form.controls._id.patchValue(String(id));
    }

    this.refreshData();
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

  refreshData(): void {

    this.loaded = false;

    if (this.fh.form.controls._id.value) {
      //Fetching the credential:
      this.core.data.getById(DataEntity.Credential, this.fh.form.controls._id.value, true)
        .subscribe((data: APIResponse<Credential>) => {
          //If the credential doesn't exists:
          if (data.count == 0) {
            this.core.toaster.showWarning("If you access directly with a link, maybe is broken. Go to the Browse page and try a search.", "Could not find the item")
            this.newItem();
            this.loaded = true;
          }
          else {
            let cred: Credential = data.data[0];
            this.fh.setValue(cred);
            this._createFieldsFromArray(cred.fields, true);
            this.fh.form.updateValueAndValidity();

            //Fetching the Secret:
            this.core.data.getById(DataEntity.Secret, this.fh.form.controls.secretId.value, true)
              .subscribe((data: APIResponse<Secret<SecretValue>>) => {
                if (data.count == 0) {
                  //If the secret is missing for some reason, we must prepare the form to enter the secret 
                  //part of the credential again:
                  this.newItem(true);
                  this.loaded = true;

                  this.core.toaster.showError("The secret part of the credential is missing.", "Partial credential information.")
                  this.core.dialog.showConfirmDialog(new StandardDialogConfiguration("Credential information is missing",
                    `The secret part of the credential is missing! This could happen as a result of a database 
migration or data corruption.
<p class="mt-2 mb-0">To prevent dependent PowerShell scripts from failing, you must re-enter the 
missing sensitive data in the form again.</p>`))
                    .subscribe((result: DialogResult<any>) => {
                    }, err => {
                      throw err
                    });
                }
                else {
                  this.secret = data.data[0];
                  this.secretIsValid = true;
                  this.fh.form.controls.secretId.patchValue(this.secret._id);
                  this.fh.form.updateValueAndValidity();
                  this.loaded = true;
                }
              },
                err => { //If There was an error loading the Secret:
                  let cryptoError: boolean = false;

                  if (err.error?.errors?.length > 0) {
                    cryptoError = (err.error.errors[0].errorCode?.key?.toString() == ErrorCodes.CryptoError.key);
                  }

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
                      .subscribe((result: DialogResult<any>) => {
                        //If the user is cancelling, wewill redirect to the Browse credentials page:
                        if (result.isCancel) {
                          this.core.navigation.toBrowseCredentials();
                        }
                        else { //If the user decide to enter the credential again.

                          //We must try to delete the old one first
                          this.core.data.delete(DataEntity.Secret, this.fh.form.controls.secretId.value)
                            .subscribe((results: APIResponse<string>) => {
                              //Old Secret was deleted!                      
                            }, err => {
                              //We give our best!
                            })

                          //Whatever the error is, we need to create a new secret in the form, (because the 
                          //persisted one is gone):
                          this.newItem(true);
                          this.loaded = true;
                        }
                      }, err => {
                        throw err
                      });
                  }
                  else {
                    //If is another kind of error, we can't continue:
                    this.newItem(true);
                    this.loaded = true;
                    throw err
                  }
                });
          }
        },
          err => { //If there was an error loading the credential, we are going to prepare a new credential form:
            this.newItem();
            this.loaded = true;
            throw err
          });
    }
    else {
      this.newItem();
      this.loaded = true;
    }
  }

  newItem(secretOnly: boolean = false) {
    let cred: Credential = new Credential();

    cred.credentialType = this.fh.value.credentialType
    this.secret = SecretFactory.createFromCredential(cred);

    //If we need to create not only a Credential Secret but the whole Credentials object:
    if (!secretOnly) {
      this.fh.setValue(cred);
      this._createFieldsFromArray(cred.fields, true);
    }

    //Ensuring we are going to create a new Secret:
    this.fh.form.controls.secretId.patchValue(this.secret._id);
    this.fh.form.updateValueAndValidity();
  }

  addField() {

    this.fh.form.controls.fields.markAllAsTouched();
    this.core.dialog.showCustomFieldDialog(new ParameterValue())
      .subscribe((dlgResults: DialogResult<ParameterValue>) => {

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
        err => {
          throw err
        });
  }

  removeField(i: number) {
    (this.fh.form.controls.fields as FormArray).removeAt(i);
    this.fh.form.controls.fields.markAllAsTouched();
    this.fh.form.controls.fields.markAsDirty();
  }

  editField(i: number) {

    this.fh.form.controls.fields.markAllAsTouched();
    this.core.dialog.showCustomFieldDialog(this._getCustomField(i))
      .subscribe((dlgResults: DialogResult<ParameterValue>) => {

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
        err => {
          throw err
        });
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

    this.core.data.save(DataEntity.Secret, this.secret)
      .subscribe((results: APIResponse<string>) => {

        // this.secret._id = results.data[0];
        //Updating the secret id in the credential:
        this.fh.form.controls.secretId.patchValue(results.data[0]);
        //Signaling the inner component to indicate the data was saved:
        // this.saved.next();

        //Now we save the credential:
        this.core.data.save(DataEntity.Credential, this.fh.value)
          .subscribe((results: APIResponse<string>) => {
            this.core.toaster.showSuccess("Changes have been saved succesfully.");
            this.fh.setId(results.data[0]);
            this.fh.setValue(this.fh.value) //This is the saved value now, so setting this value 
            //will allow the "Cancel" button to come back to this version.
            this.fh.form.markAsPristine();
            this.fh.form.markAsUntouched();
            
            //Signaling the inner component to indicate the data was saved:
            this.secret._id = this.fh.value.secretId;
            this.saved.next();
    
          },
            (err) => {
              //If there was an error trying to save the Credential and is a new credential,
              //we need to try to remove the Secret that was already saved in the previous
              //transaction:
              if (!this.fh.value._id) {

                this.core.data.delete(DataEntity.Secret, this.fh.value.secretId)
                .subscribe((results: APIResponse<string>) => {
                  //Our best attempt here.
                },
                (err) => {});

                //Removing the Id from the credential:
                this.fh.form.controls.secretId.patchValue("");
              }

              throw err
            }
          );
      },
        (err) => {
          throw err
        }
      );
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
      (this.fh.form.controls.fields as FormArray).clear();
    }

    if (fields && fields.length > 0) {
      fields.forEach((field: ParameterValue) => {
        //Adding the controls to the array:
        (this.fh.form.controls.fields as FormArray).push(new FormGroup({
          name: new FormControl(field.name),
          value: new FormControl(field.value),
          nativeType: new FormControl(field.nativeType)
        }));
      })
    }
  }

  private _getCustomField(index: number): ParameterValue {
    return ((this.fh.form.controls.fields as FormArray).controls[index].value as ParameterValue);
  }
}
