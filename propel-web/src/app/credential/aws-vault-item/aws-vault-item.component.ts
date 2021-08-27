import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { FormSubcomponentInterface, FormSubcomponentEventData } from 'src/core/form-subcomponent';
import { CoreService } from 'src/services/core.service';
import { AWSVaultItem } from '../../../../../propel-shared/models/aws-vault-item';

const ACCESSKEY_MAX: number = 20;
const SECRETKEY_MAX: number = 40;

@Component({
  selector: 'app-aws-vault-item',
  templateUrl: './aws-vault-item.component.html',
  styleUrls: ['./aws-vault-item.component.css']
})
export class AWSVaultItemComponent implements OnInit, FormSubcomponentInterface<AWSVaultItem> {

  //#region FormSubcomponentInterface implementation

  @Input() model: AWSVaultItem;

  @Input() reset: Observable<void>;

  @Input() saved: Observable<void>;

  /**
   * Change event, will be throw every time the form suffer any change.
   */
  @Output() subFormChange = new EventEmitter<FormSubcomponentEventData<AWSVaultItem>>();

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
  previousValue: AWSVaultItem;

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

  toggleViewAccessKey() {
    this.viewAccessKey = !this.viewAccessKey;
  }

  toggleViewSecretKey() {
    this.viewSecretKey = !this.viewSecretKey;
  }
}
