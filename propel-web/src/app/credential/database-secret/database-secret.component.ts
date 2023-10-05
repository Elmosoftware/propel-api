import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { FormSubcomponentInterface, FormSubcomponentEventData } from 'src/core/form-subcomponent';
import { CoreService } from 'src/services/core.service';
import { DatabaseSecret } from '../../../../../propel-shared/models/database-secret';
import { CrossFieldCustomValidatorResults, ValidatorsHelper } from 'src/core/validators-helper';

const USERNAME_MAX: number = 255;
const PASSWORD_MAX: number = 255;
const CONNECTIONSTRING_MAX: number = 1024; //https://learn.microsoft.com/en-us/dotnet/api/system.data.odbc.odbcconnection.connectionstring?view=dotnet-plat-ext-7.0

@Component({
  selector: 'app-database-secret',
  templateUrl: './database-secret.component.html',
  styleUrls: ['./database-secret.component.css']
})
export class DatabaseSecretComponent implements OnInit, FormSubcomponentInterface<DatabaseSecret>{

  //#region FormSubcomponentInterface implementation

  @Input() model!: DatabaseSecret;

  @Input() reset!: Observable<void>;

  @Input() saved!: Observable<void>;

  /**
   * Change event, will be throw every time the form suffer any change.
   */
  @Output() subFormChange = new EventEmitter<FormSubcomponentEventData<DatabaseSecret>>();

  get isValid(): boolean {
    return (this.fg) ? this.fg.valid : true;
  };

  get isDirty(): boolean {
    return (this.fg) ? this.fg.dirty : false;
  }

  //#endregion

  private requestCount$: EventEmitter<number>;
  fg: FormGroup;
  viewPassword: boolean = false;
  previousValue!: DatabaseSecret;

  constructor(private core: CoreService) {

    this.fg = new FormGroup({
      user: new FormControl("", [
        Validators.maxLength(USERNAME_MAX)
      ]),
      password: new FormControl("", [
        Validators.maxLength(PASSWORD_MAX)
      ]),
      connectionString: new FormControl("", [
        Validators.maxLength(CONNECTIONSTRING_MAX)
      ])
    }, {
      validators: ValidatorsHelper.crossFieldCustomValidator(this.validateAllFields, ["password", "connectionString"])
    });

    this.requestCount$ = this.core.navigation.getHttpRequestCountSubscription()
    this.requestCount$
      .subscribe({
        next: (count: number) => {
          if (count > 0) {
            this.fg.disable({ emitEvent: false });
          }
          else {
            this.fg.enable({ emitEvent: false });
          }
        }
      })
  }

  validateAllFields(values: { [key: string]: any }): CrossFieldCustomValidatorResults | null {
    let userAndPassInValid: boolean = (values["user"] == "" || values["password"] == "")
    let connStringInvalid: boolean = (values["connectionString"] == "")

    if (userAndPassInValid && connStringInvalid) {
      return {
        crossFieldCustomValidator: {
          message: "You can specify the User and Password or the connection string. But at " + 
          "least one of those groups need to be fulfilled."
        }
      }
    }

    return null;
  }

  ngOnInit(): void {
    if (this.model) {
      this.previousValue = Object.assign({}, this.model);
      this.fg.patchValue(this.model);

      this.fg.valueChanges.subscribe({
        next: (secret) => {
          this.subFormChange.emit(new FormSubcomponentEventData(secret, this.fg.valid));
        }
      })
    }

    if (this.reset) {
      this.reset
        .subscribe({
          next: () => {
            this.fg.patchValue(this.previousValue);
            this.fg.markAsPristine();
            this.fg.markAsUntouched();
          }
        })
    }

    if (this.saved) {
      this.saved
        .subscribe({
          next: () => {
            this.previousValue = this.fg.value;
            this.fg.markAsPristine();
            this.fg.markAsUntouched();
          }
        })
    }
  }

  toggleViewPassword() {
    this.viewPassword = !this.viewPassword;
  }
}
