import { Component, OnInit, ViewChild, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { DataLossPreventionInterface } from 'src/core/data-loss-prevention-guard';
import { FormHandler } from 'src/core/form-handler';
import { ValidatorsHelper } from 'src/core/validators-helper';
import { CoreService } from 'src/services/core.service';
import { DataEndpointActions } from 'src/services/data.service';
import { SystemHelper } from 'src/util/system-helper';
import { APIResponse } from '../../../../propel-shared/core/api-response';
import { UserRegistrationResponse } from '../../../../propel-shared/core/user-registration-response';
import { compareEntities } from '../../../../propel-shared/models/entity';
import { UserAccount } from '../../../../propel-shared/models/user-account';
import { UserAccountRoles } from '../../../../propel-shared/models/user-account-roles';
import { Utils } from '../../../../propel-shared/utils/utils';

@Component({
  selector: 'app-user-account',
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.css']
})
export class UserAccountComponent implements OnInit, DataLossPreventionInterface {

  @ViewChild("role") roleDropdown;

  private requestCount$: EventEmitter<number>;
  fh: FormHandler<UserAccount>;
  allRoles: any[] = [];
  loaded: boolean = false;
  authCode: string = "";
  lastUserLogin: Date = null;

  //Form validation constant parameters:
  validationParams: any = {
    get nameMaxLength() { return 25 },
    get namePattern() { return "^[0-9a-zA-Z\.]+$" },
    get fullNameMaxLength() { return 50 },
    get initialsMaxLength() { return 2 },
    get initialsPattern() { return "^[a-zA-Z]+$" },
    get emailPattern() { return "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$" }
  }

  get canEditName(): boolean {
    return !Boolean(this.lastUserLogin);
  }

  constructor(private core: CoreService, private route: ActivatedRoute) {
    this.fh = new FormHandler(DataEndpointActions.UserAccount, new FormGroup({
      name: new FormControl("", [
        Validators.required,
        Validators.maxLength(this.validationParams.nameMaxLength),
        ValidatorsHelper.pattern(new RegExp(this.validationParams.namePattern, "g"),
          "The user name can contain letters, numbers and the dot character only.")
      ]),
      fullName: new FormControl("", [
        Validators.required,
        Validators.maxLength(this.validationParams.fullNameMaxLength)
      ]),
      initials: new FormControl("", [
        Validators.required,
        Validators.maxLength(this.validationParams.initialsMaxLength),
        ValidatorsHelper.pattern(new RegExp(this.validationParams.initialsPattern, "g"),
          "The user initials can contain only letters.")
      ]),
      email: new FormControl("", [
        Validators.required,
        ValidatorsHelper.pattern(new RegExp(this.validationParams.emailPattern, "g"),
          "The user e-mail must be a valid email.")
      ]),
      role: new FormControl("", [
        Validators.required
      ]),
      secretId: new FormControl(""),
      lastPasswordChange: new FormControl(""),
      lastLogin: new FormControl(""),
      mustReset: new FormControl(""),
      lockedSince: new FormControl(""),
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

    //If a user id is provided:
    if (id) {
      this.fh.form.controls._id.patchValue(String(id));
    }

    //Doing this with a timeout to avoid the "ExpressionChangedAfterItHasBeenCheckedError" error:
    setTimeout(() => {
      forkJoin([
        this.refreshRoles()
        //if there is anything else to refresh, add it here...
      ])
        .subscribe((results) => {

          //We are adding here a temporary field "disabled". This field 
          //is required for the @NgSelect component to identify disabled items in the list and prevent 
          //them to be selected:

          //@ts-ignore
          this.allRoles = results[0].map(item => {
            //@ts-ignore
            item.disabled = false;
            return item;
          });

          this.refreshData();
        });
    });
  }

  /**
   * Used by the dropdowns to compare the values.
   */
  compareFn: Function = compareEntities;

  dataChanged(): boolean | Observable<boolean> | Promise<boolean> {
    return this.core.dataChanged(this.fh);
  }

  refreshData(): void {

    this.loaded = false;

    if (this.fh.form.controls._id.value) {
      //Fetching the user account:
      this.core.security.getUser(this.fh.form.controls._id.value)
        .subscribe((data: APIResponse<UserAccount>) => {

          //If the user account doesn't exists:
          if (data.count == 0) {
            this.core.toaster.showWarning("If you access directly with a link, maybe is broken. Go to the Browse page and try a search.", "Could not find the item")
            this.newItem();
          }
          else {
            let user: UserAccount = data.data[0];
            this.lastUserLogin = user.lastLogin;
            this.setFormValue(user);
          }

          this.loaded = true;
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

  refreshRoles() {
    return of(Utils.getEnum(UserAccountRoles));
  }

  newItem() {
    let user: UserAccount = new UserAccount();
    this.lastUserLogin = null;
    this.setFormValue(user);
  }

  setFormValue(value: UserAccount) {
    let item: any;

    this.fh.setValue(value);

    item = this.roleDropdown.itemsList.items.find((item) => {
      return item.value.key == value.role
    });

    if (item) {
      this.roleDropdown.select(item); //Selecting the value.en in the dropdown.      
    }

    //We need to ensure the name can't be updated when the user already log in: 
    if (this.canEditName) {
      setTimeout(() => {
        this.fh.form.controls.name.enable({ emitEvent: false });
        this.fh.form.updateValueAndValidity();
      });
    }
    else {
      setTimeout(() => {
        this.fh.form.controls.name.disable({ emitEvent: true, onlySelf: true });
        this.fh.form.updateValueAndValidity();
      });      
    }
    
    this.fh.form.updateValueAndValidity();
    this.fh.form.markAsPristine();
    this.fh.form.markAsUntouched();
  }

  save(): void {
    this.core.security.saveUser(this.fh.value)
      .subscribe((results: APIResponse<UserRegistrationResponse>) => {
        let response: UserRegistrationResponse = results.data[0];

        this.core.toaster.showSuccess("Changes have been saved succesfully.");
        
        this.fh.setId(response.userId);
        this.fh.form.controls.secretId.patchValue(response.secretId);
        this.setFormValue(this.fh.value);
        this.fh.form.markAsPristine();
        this.fh.form.markAsUntouched();
        this.authCode = response.authCode //If is a new user an auth code will be generated.

        //Replacing in the navigation history the URL so when the user navigate back 
        //and if we are creating an item it will edit the created item instead of showing 
        //a new item form:
        this.core.navigation.replaceHistory(this.fh.getId());
      },
        (err) => {
          throw err
        }
      );
  }

  resetForm() {
    if (this.fh.previousValue) {
      this.fh.resetForm();
      this.setFormValue(this.fh.value)
    }
  }

  getNameTooltip() {
    if (!this.lastUserLogin) return "";
    return `The user already login. 
There is security records kept about, so you can't change the user name from now on.`
  }

  getLastLogin(){
    if (!this.lastUserLogin) return "";
    return `User last login was ${SystemHelper.getFriendlyTimeFromNow(this.lastUserLogin)}`;
  } 
  
  getLastLoginTooltip(){
    if (!this.lastUserLogin) return "";
    return SystemHelper.formatDate(this.lastUserLogin);
  }
}
