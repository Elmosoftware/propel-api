import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

import { DialogResult } from 'src/core/dialog-result';
import { ValidatorsHelper } from 'src/core/validators-helper';
import { ParameterValue } from '../../../../../propel-shared/models/parameter-value';

const DEFAULT_MAX_LENGTH: number = 255

export type CustomValueDialogData = { value?: string | number, title?: string, typeIsString?: boolean, stringMaxLength?: number}

const DEFAULT_TITLE: string = "New value"

@Component({
  selector: 'app-custom-value-dlg',
  templateUrl: './custom-value-dlg.component.html',
  styleUrls: ['./custom-value-dlg.component.css']
})
export class CustomValueDialogComponent implements OnInit {

  fh: FormGroup;
  private _title: string = DEFAULT_TITLE;

  get title(): string {
    return this._title
  }

  constructor(public dialogRef: MatDialogRef<ParameterValue>,
    @Inject(MAT_DIALOG_DATA) public data: CustomValueDialogData) {

      let validators: ValidatorFn[] = [Validators.required]
      data = this._parseData(data)
      
      this._title = data.title || DEFAULT_TITLE;

      if (data.typeIsString) {
        validators.push(Validators.maxLength(data.stringMaxLength || DEFAULT_MAX_LENGTH))
      }
      else {
        validators.push(ValidatorsHelper.anyNumber());
      }        
      
      this.fh = new FormGroup({
        value: new FormControl(data.value, validators)
      });

      this.fh.markAsPristine();
      this.fh.markAsUntouched();
  }

  closeDlg(id: number): void {
    this.dialogRef.close(new DialogResult<any>(id, this.fh.getRawValue()));
  }

  ngOnInit(): void {
  }

  private _parseData(data?: CustomValueDialogData): CustomValueDialogData {

    //By default we are going to edit text:
    if (!data) {
      data = {
        value: undefined,
        typeIsString: true,
        stringMaxLength: DEFAULT_MAX_LENGTH
      }
    }
    
    if (data.value == undefined || data.value == null) {
      if(data.typeIsString == undefined || data.typeIsString == null) {
        data.typeIsString = true;
      }  
    }
    else {
      data.typeIsString = (typeof data.value == "string")
    }

    if (data.typeIsString && !data.stringMaxLength ) {
      data.stringMaxLength == DEFAULT_MAX_LENGTH;
    }

    return data
  }
}
