import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { DialogResult } from 'src/core/dialog-result';
import { FormHandler } from 'src/core/form-handler';
import { ValidatorsHelper } from 'src/core/validators-helper';
import { DataEntity } from 'src/services/data.service';
import { ParameterValue } from '../../../../../propel-shared/models/parameter-value';

const NAME_MAX: number = 20
const VALUE_MAX: number = 255
const DEFAULT_NATIVETYPE: string = "String"

@Component({
  selector: 'app-custom-field-dlg',
  templateUrl: './custom-field-dlg.component.html',
  styleUrls: ['./custom-field-dlg.component.css']
})
export class CustomFieldDialogComponent implements OnInit {

  fh: FormHandler<ParameterValue>;

  get title(): string {
    return "Custom field"
  }

  constructor(public dialogRef: MatDialogRef<ParameterValue>,
    @Inject(MAT_DIALOG_DATA) public config: any) {
      
      this.fh = new FormHandler(DataEntity.Group, new FormGroup({
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
        nativeType: new FormControl(DEFAULT_NATIVETYPE)
      }));

      if (config) {
        config.nativeType = DEFAULT_NATIVETYPE;
        this.fh.setValue(config);
      }
      else {
        let p = new ParameterValue();
        p.nativeType =  DEFAULT_NATIVETYPE;
        this.fh.setValue(p);
      }
  }

  closeDlg(id): void {
    this.dialogRef.close(new DialogResult<any>(id, this.fh.value));
  }

  ngOnInit(): void {
  }
}
