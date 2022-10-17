import { Component, EventEmitter, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ValidatorsHelper } from 'src/core/validators-helper';
import { CoreService } from 'src/services/core.service';
import { PropelError } from '../../../../propel-shared/core/propel-error';
import { SecurityRequest } from '../../../../propel-shared/core/security-request';
import { SecuritySharedConfiguration } from '../../../../propel-shared/core/security-shared-config';
import { UserAccount } from '../../../../propel-shared/models/user-account';

//User form Messages:
const MSG_USER_REGULAR_LOGIN: string = `Please enter your user account below. If your security credentials have 
not been provided yet, please contact a Propel System administrator about.`;
const MSG_USER_PRELOAD_NOT_FOUND: string = `You are running Propel with the below account. 
The account doesn't exists, please contact a Propel System administrator in order to be granted.`
const MSG_USER_NOT_FOUND: string = `The Propel user account doesn't exist. Please review and try again. 
If you consider you must have access please contact a Propel System administrator about.`

//Password form messages:
const MSG_PASSWORD_REGULAR_LOGIN: string = `Please enter your password below.
If you forget it, please contact a Propel System administrator in order to reset your password 
and get a new authorization code.`;
const MSG_PASSWORD_FIRST_LOGIN: string = `Welcome to Propel {USER_FULLNAME}, it's great to have you! 
I hope you'll enjoy all the features Propel have for you.
Please enter your authentication code below and then set your new password.`;
const MSG_PASSWORD_RESET: string = `Your password was reset by a System administrator who has 
surely provided you with an authentication code. 
Please enter it below and then set your new password.`;
const MSG_LOGIN_START: string = `Starting login process ...`;
const MSG_LOGIN_ERROR: string = `There was an error during the login process. 
Please retry later.`;
const MSG_LOGIN_SUCCESS: string = `Your credentials were validated successfully. Redirecting to our landing page ...`;

enum FormsSection {
  PreloadRuntimeInfo = "preload",
  User = "user",
  Password = "password"
}

enum LoginType {
  Regular = 0,
  First = 1,
  Reset = 2
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private requestCount$: EventEmitter<number>;
  fg: UntypedFormGroup;
  viewAuthCodeOrPassword: boolean = false;
  viewNewPassword: boolean = false;
  viewPasswordConfirmation: boolean = false;
  referrerURL: string = "";

  //Form validation constant parameters:
  validationParams: any;
  formFlow!: FormFlow;

  constructor(private core: CoreService, private route: ActivatedRoute) {

    this.validationParams = {
      get nameMaxLength() { return 25 },
      get namePattern() { return "^[0-9a-zA-Z\.]+$" },
    }

    this.fg = new UntypedFormGroup({
      name: new UntypedFormControl("", [
        Validators.required,
        Validators.maxLength(this.validationParams.nameMaxLength),
        ValidatorsHelper.pattern(new RegExp(this.validationParams.namePattern, "g"),
          "The user name can contain letters, numbers and the dot character only.")
      ]),
      authCodeOrPassword: new UntypedFormControl(""),
      newPassword: new UntypedFormControl(""),
      passwordConfirmation: new UntypedFormControl("")
    });

    this.requestCount$ = this.core.navigation.getHttpRequestCountSubscription()
    this.requestCount$
      .subscribe((count: number) => {
        if (count > 0) {
          this.fg.disable({ emitEvent: false });
        }
        else {
          this.fg.enable({ emitEvent: false });
        }
      })
  }

  ngOnInit(): void {
    // ////////////////////////////////////////////////////////////////////////////
    // if (environment.production == false) {
    //   //DEBUG ONLY:
    //   //  For debugging purposes only
    //   //  If the autologin feature was set in the SessionService, we can here 
    //   //  log automatically the user for testing purposes only:
    //     let ri: any = this.core.security.runtimeInfo

    //     if (ri && ri.password) {
    //       let sr: SecurityRequest = new SecurityRequest();
    //       sr.userName = ri.userName;
    //       sr.password = ri.password;
    //       this.execLogin(sr);
    //       this.core.toaster.showWarning(`You just log in as ${sr.userName}`, "AUTO LOGIN is enabled!")
    //     }
    // }
    // ////////////////////////////////////////////////////////////////////////////

    this.referrerURL = this.route.snapshot.queryParamMap.get("referrerURL") ?? ""
    this.formFlow = new FormFlow();

    //If we have the user that is running Propel specified in the runtime info, then we must set it 
    //in the form and switch directly to the "passwords" section of the login form:
    if (this.core.security.runtimeInfo) {
      this.fg.controls['name'].patchValue(this.core.security.runtimeInfo.userName);
      this.formFlow.activeFormSection = FormsSection.PreloadRuntimeInfo;
      this.formFlow.isUserSectionEnabled = false;
      this.continue(); //Moving to the "password" section.
    }
    else {
      this.formFlow.activeFormSection = FormsSection.User;
      this.formFlow.isUserSectionEnabled = true;
      this.formFlow.message = MSG_USER_REGULAR_LOGIN;
    }
  }

  toggleViewAuthCodeOrPassword() {
    this.viewAuthCodeOrPassword = !this.viewAuthCodeOrPassword;
  }

  toggleViewNewPassword() {
    this.viewNewPassword = !this.viewNewPassword;
  }

  toggleViewPasswordConfirmation() {
    this.viewPasswordConfirmation = !this.viewPasswordConfirmation;
  }

  continue() {

    if (!this.fg.controls['name'].valid) return;

    this.core.security.getConfig()
      .then((config: SecuritySharedConfiguration) => {

        this.core.security.getUser(this.fg.controls['name'].value)
          .then((data: UserAccount) => {

            //If the user account doesn't exists:
            if (!data) {
              if (this.formFlow.activeFormSection == FormsSection.PreloadRuntimeInfo) {
                this.formFlow.message = MSG_USER_PRELOAD_NOT_FOUND;
              }
              else {
                this.formFlow.message = MSG_USER_NOT_FOUND;
              }
              this.formFlow.messageIsError = true
              this.formFlow.isUserSectionEnabled = true;
              this.formFlow.activeFormSection = FormsSection.User
            }
            else {
              this.formFlow.user = data;
              this.formFlow.messageIsError = false;
              this.formFlow.activeFormSection = FormsSection.Password
              this.formFlow.authCodeOrPasswordPlaceholder = "Enter here the provided authorization code."

              //If is the first login of the user:
              if (!this.formFlow.user.lastLogin) {
                this.formFlow.message = MSG_PASSWORD_FIRST_LOGIN.replace("{USER_FULLNAME}",
                  this.formFlow.user.fullName);
                this.formFlow.loginType = LoginType.First;
              }
              //If the user must reset his password:
              else if (this.formFlow.user.mustReset) {
                this.formFlow.message = MSG_PASSWORD_RESET;
                this.formFlow.loginType = LoginType.Reset;
              }
              else {
                this.formFlow.message = MSG_PASSWORD_REGULAR_LOGIN;
                this.formFlow.authCodeOrPasswordPlaceholder = "Enter your password here."
                this.formFlow.loginType = LoginType.Regular;
              }

              //Preparing the form controls:
              //Preparing the form controls:
              this.fg.controls['authCodeOrPassword'].patchValue("");
              this.fg.controls['authCodeOrPassword'].clearValidators();
              this.fg.controls['newPassword'].patchValue("");
              this.fg.controls['newPassword'].clearValidators();
              this.fg.controls['passwordConfirmation'].patchValue("");
              this.fg.controls['passwordConfirmation'].clearValidators();

              //If is a regular login we just need the password field:
              if (this.formFlow.loginType == LoginType.Regular) {
                this.fg.controls['authCodeOrPassword'].addValidators([
                  Validators.required,
                  Validators.maxLength(config.passwordMaxLength),
                  Validators.minLength(config.passwordMinLength)
                ])
              }
              //For any other case we need the new password and the password confirmation fields:
              else {
                this.fg.controls['authCodeOrPassword'].addValidators([
                  Validators.required,
                  ValidatorsHelper.exactLength(config.authCodeLength)
                ])
                this.fg.controls['newPassword'].addValidators([
                  Validators.required,
                  Validators.minLength(config.passwordMinLength),
                  Validators.maxLength(config.passwordMaxLength)
                ])
                this.fg.controls['passwordConfirmation'].addValidators([
                  Validators.required,
                  ValidatorsHelper.fieldsEquality("newPassword", "passwordConfirmation",
                    `The new passwords do not match. Please verify the values entered.`)
                ])
              }

              this.fg.updateValueAndValidity();
            }
          },
            (error) => {
              this.core.handleError(error)
            });
      })
  }

  login() {
    let sr: SecurityRequest = new SecurityRequest();

    if (!this.fg.valid) return

    this.formFlow.message = MSG_LOGIN_START;
    this.formFlow.messageIsError = false;

    sr.userName = this.fg.controls['name'].value;
    sr.password = this.fg.controls['authCodeOrPassword'].value;

    //if is a first login or a password reset:
    if (this.formFlow.loginType !== LoginType.Regular) {
      sr.newPassword = this.fg.controls['newPassword'].value;
    }

    this.execLogin(sr)
    .catch((error) => {
      this.core.handleError(error)
    })
  }

  async execLogin(sr: SecurityRequest): Promise<void> {

    try {
      await this.core.security.login(sr);

      this.formFlow.message = MSG_LOGIN_SUCCESS;
      this.formFlow.messageIsError = false

      if (this.referrerURL) {
        this.core.navigation.to(this.referrerURL)
      }
      else {
        this.core.navigation.toHome();
      }
    }
    catch (error) {
      let e = new PropelError(error as Error);

      this.formFlow.message = e.userMessage || MSG_LOGIN_ERROR;
      this.formFlow.messageIsError = true
      return Promise.reject(e)
    }
  }

  goBack() {
    if (this.formFlow.activeFormSection == FormsSection.User) {
      this.navigateBack()
    }
    else if (this.formFlow.activeFormSection == FormsSection.Password) {
      if (this.formFlow.isUserSectionEnabled) {
        this.formFlow.activeFormSection = FormsSection.User; //Back to the user section
      }
      else {
        this.navigateBack()
      }
    }
  }

  private navigateBack() {
    if (this.core.navigation.previousPage) {
      this.core.navigation.back();
    }
    else {
      this.core.navigation.toHome();
    }
  }
}

/**
 * Internal use only. To keep track of the form state.
 */
class FormFlow {
  activeFormSection: FormsSection = FormsSection.PreloadRuntimeInfo;
  authCodeOrPasswordPlaceholder: string = "";
  messageIsError: boolean = false;
  message: string = "";
  loginType: LoginType = LoginType.Regular;
  user!: UserAccount;
  isUserSectionEnabled: boolean = true
}
