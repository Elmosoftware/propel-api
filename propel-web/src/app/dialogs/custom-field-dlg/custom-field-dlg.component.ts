import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { DialogResult } from 'src/core/dialog-result';
import { ValidatorsHelper } from 'src/core/validators-helper';
import { JSType } from '../../../../../propel-shared/core/type-definitions';
import { ParameterValue } from '../../../../../propel-shared/models/parameter-value';

const NAME_MAX: number = 20
const VALUE_MAX: number = 255
const DEFAULT_NATIVETYPE: string = JSType.String

@Component({
  selector: 'app-custom-field-dlg',
  templateUrl: './custom-field-dlg.component.html',
  styleUrls: ['./custom-field-dlg.component.css']
})
export class CustomFieldDialogComponent implements OnInit {

  fh: FormGroup;

  get title(): string {
    return "Custom field"
  }

  constructor(public dialogRef: MatDialogRef<ParameterValue>,
    @Inject(MAT_DIALOG_DATA) public config: any) {
      
      this.fh = new FormGroup({
        name: new FormControl("", [
          Validators.required,
          Validators.maxLength(NAME_MAX),
          ValidatorsHelper.pattern(new RegExp("^[a-zA-Z0-9]+$", "g"), 
            "A field name must contain only letters and numbers, any other character is invalid.")
        ]),
        value: new FormControl("", [
          Validators.required,
          Validators.maxLength(VALUE_MAX)
        ]),
        nativeType: new FormControl(DEFAULT_NATIVETYPE),
        isRuntimeParameter: new FormControl(false)
      });

      if (config) {
        config.nativeType = DEFAULT_NATIVETYPE;
        this.fh.patchValue(config);
      }
      else {
        let p = new ParameterValue();
        p.nativeType =  DEFAULT_NATIVETYPE;
        this.fh.patchValue(p);
      }
      
      this.fh.markAsPristine();
      this.fh.markAsUntouched();
  }

  closeDlg(id: number): void {
    this.dialogRef.close(new DialogResult<any>(id, this.fh.getRawValue()));
  }

  ngOnInit(): void {
  }
}
