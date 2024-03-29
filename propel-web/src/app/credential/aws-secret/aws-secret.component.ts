import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { FormSubcomponentInterface, FormSubcomponentEventData } from 'src/core/form-subcomponent';
import { CoreService } from 'src/services/core.service';
import { AWSSecret } from '../../../../../propel-shared/models/aws-secret';

const ACCESSKEY_MAX: number = 20;
const SECRETKEY_MAX: number = 40;

@Component({
  selector: 'app-aws-secret',
  templateUrl: './aws-secret.component.html',
  styleUrls: ['./aws-secret.component.css']
})
export class AWSSecretComponent implements OnInit, FormSubcomponentInterface<AWSSecret> {

  //#region FormSubcomponentInterface implementation

  @Input() model!: AWSSecret;

  @Input() reset!: Observable<void>;

  @Input() saved!: Observable<void>;

  /**
   * Change event, will be throw every time the form suffer any change.
   */
  @Output() subFormChange = new EventEmitter<FormSubcomponentEventData<AWSSecret>>();

  get isValid(): boolean {
    return (this.fg) ? this.fg.valid : true;
  };

  get isDirty(): boolean {
    return (this.fg) ? this.fg.dirty : false;
  }

  //#endregion

  private requestCount$: EventEmitter<number>;
  fg: FormGroup;
  viewAccessKey: boolean = false;
  viewSecretKey: boolean = false;
  previousValue!: AWSSecret;

  constructor(private core: CoreService) {

    this.fg = new FormGroup({
      accessKey: new FormControl("", [
        Validators.required,
        Validators.maxLength(ACCESSKEY_MAX)
      ]),
      secretKey: new FormControl("", [
        Validators.required,
        Validators.maxLength(SECRETKEY_MAX)
      ])
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

  toggleViewAccessKey() {
    this.viewAccessKey = !this.viewAccessKey;
  }

  toggleViewSecretKey() {
    this.viewSecretKey = !this.viewSecretKey;
  }
}
