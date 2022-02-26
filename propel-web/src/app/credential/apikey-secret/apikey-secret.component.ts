import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { FormSubcomponentInterface, FormSubcomponentEventData } from 'src/core/form-subcomponent';
import { CoreService } from 'src/services/core.service';
import { GenericAPIKeySecret } from '../../../../../propel-shared/models/generic-apikey-secret';

const APPID_MAX: number = 256;
const APIKEY_MAX: number = 256;

@Component({
  selector: 'app-apikey-secret',
  templateUrl: './apikey-secret.component.html',
  styleUrls: ['./apikey-secret.component.css']
})
export class APIKeySecretComponent implements OnInit, FormSubcomponentInterface<GenericAPIKeySecret> {

  //#region FormSubcomponentInterface implementation

  @Input() model: GenericAPIKeySecret;

  @Input() reset: Observable<void>;

  @Input() saved: Observable<void>;

  /**
   * Change event, will be throw every time the form suffer any change.
   */
  @Output() subFormChange = new EventEmitter<FormSubcomponentEventData<GenericAPIKeySecret>>();

  get isValid(): boolean {
    return (this.fg) ? this.fg.valid : true;
  };

  get isDirty(): boolean {
    return (this.fg) ? this.fg.dirty : false;
  }

  //#endregion

  private requestCount$: EventEmitter<number>;
  fg: FormGroup;
  viewAppId: boolean = false;
  viewAPIKey: boolean = false;
  previousValue: GenericAPIKeySecret;

  constructor(private core: CoreService) {

    this.fg = new FormGroup({
      appId: new FormControl("", [
        Validators.required,
        Validators.maxLength(APPID_MAX)
      ]),
      apiKey: new FormControl("", [
        Validators.required,
        Validators.maxLength(APIKEY_MAX)
      ])
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
    if (this.model) {
      this.previousValue = Object.assign({}, this.model);
      this.fg.patchValue(this.model);

      this.fg.valueChanges.subscribe((secret) => {
        this.subFormChange.emit(new FormSubcomponentEventData(secret, this.fg.valid));
      })
    }

    if (this.reset) {
      this.reset
        .subscribe(() => {
          this.fg.patchValue(this.previousValue);
          this.fg.markAsPristine();
          this.fg.markAsUntouched();
        })
    }

    if (this.saved) {
      this.saved
        .subscribe(() => {
          this.previousValue = this.fg.value;
          this.fg.markAsPristine();
          this.fg.markAsUntouched();
        })
    }
  }

  toggleViewAppId() {
    this.viewAppId = !this.viewAppId;
  }

  toggleViewAPIKey() {
    this.viewAPIKey = !this.viewAPIKey;
  }
}
