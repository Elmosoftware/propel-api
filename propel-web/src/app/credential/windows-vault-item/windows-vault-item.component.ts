import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { FormSubcomponentInterface, FormSubcomponentEventData } from 'src/core/form-subcomponent';
import { CoreService } from 'src/services/core.service';
import { WindowsVaultItem } from '../../../../../propel-shared/models/windows-vault-item';

const USERNAME_MAX: number = 255;
const DOMAIN_MAX: number = 512;
const PASSWORD_MAX: number = 255

@Component({
  selector: 'app-windows-vault-item',
  templateUrl: './windows-vault-item.component.html',
  styleUrls: ['./windows-vault-item.component.css']
})
export class WindowsVaultItemComponent implements OnInit, FormSubcomponentInterface<WindowsVaultItem> {

  //#region FormSubcomponentInterface implementation

  @Input() model: WindowsVaultItem;

  @Input() reset: Observable<void>;

  @Input() saved: Observable<void>;

  /**
   * Change event, will be throw every time the form suffer any change.
   */
  @Output() subFormChange = new EventEmitter<FormSubcomponentEventData<WindowsVaultItem>>();

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
  previousValue: WindowsVaultItem;

  constructor(private core: CoreService) {

    this.fg = new FormGroup({
      userName: new FormControl("", [
        Validators.required,
        Validators.maxLength(USERNAME_MAX)
      ]),
      domain: new FormControl("", [
        Validators.maxLength(DOMAIN_MAX)
      ]),
      password: new FormControl("", [
        Validators.required,
        Validators.maxLength(PASSWORD_MAX)
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

  toggleViewPassword() {
    this.viewPassword = !this.viewPassword;
  }
}
