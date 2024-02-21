import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ParameterValue } from '../../../../propel-shared/models/parameter-value';
import { CoreService } from 'src/services/core.service';
import { DialogResult } from 'src/core/dialog-result';
import { JSType } from '../../../../propel-shared/core/type-definitions';

@Component({
  selector: 'app-object-editor',
  templateUrl: './object-editor.component.html',
  styleUrls: ['./object-editor.component.css']
})
export class ObjectEditorComponent implements OnInit {

  @Input("values") values!: ParameterValue[];

  /**
   * Change event, will be throw every time the form suffer any change.
   */
  @Output() change = new EventEmitter<ParameterValue[]>();

  fg: FormGroup;

  get items(): any[] {
    // return ((this.fg.controls['items'] as UntypedFormArray).controls as ParameterValue[])
    return (this.fg.controls['items'] as UntypedFormArray).controls
  }

  constructor(private core: CoreService) {
    this.fg = new FormGroup({
      items: new UntypedFormArray([])
    });

  }

  ngOnInit(): void {

    this.fg.statusChanges
      .subscribe({
        next: (value: string) => {

          let items: ParameterValue[] = [];

          (this.fg.controls['items'] as UntypedFormArray).controls.forEach((item: any) => {
            items.push(item.value)
          })

          this.values = items
          this.change.emit(this.values);
        }
      })
  }

  addItem() {
    this.editItem()
  }

  editItem(index?: number | undefined) {
    this.fg.controls['items'].markAllAsTouched();

    this.core.dialog.showCustomFieldDialog(this._getItemByIndex(index))
      .subscribe({
        next: (dlgResults: DialogResult<ParameterValue>) => {
          if (!dlgResults.isCancel) {

            let pv: ParameterValue = dlgResults.value;
            let newValues = [...this.values];

            if (pv) {
              //We need to ensure the field keeps being unique:
              if (this._itemIsUnique(newValues, pv.name, index)) {
                if (index == undefined || index < 0) {
                  newValues.push(pv)
                }
                else {
                  newValues[index] = pv
                }
                this._patchForm(newValues);
                this.fg.updateValueAndValidity();
                this.fg.markAsDirty();
              }
              else {
                this.core.toaster.showWarning("The property name supplied is already in use.", "Duplicated property")
              }
            }
          }
        },
        error: (error) => {
          this.core.handleError(error)
        }
      }
      );
  }

  removeField(index: number) {
    (this.fg.controls['items'] as UntypedFormArray).removeAt(index);
    this.fg.controls['items'].markAllAsTouched();
    this.fg.controls['items'].markAsDirty();
  }

  getIsLiteralFlag(index: number): boolean {

    // return true;
    // if (!Array.isArray(this.values)) return false

    // let pv: ParameterValue = this._getItemByIndex(value);
    // return pv.nativeType == JSType.Object
    // return value.nativeType == JSType.Object
    return this.values[index].nativeType == JSType.Object
  }

  isLiteralFlagChanged(index:number): void {
    // if (!Array.isArray(this.values)) return

    let newValues = [...this.values];

    if (newValues[index].nativeType == JSType.Object) {
      newValues[index].nativeType = JSType.String
    }
    else {
      newValues[index].nativeType = JSType.Object
    }

    this._patchForm(newValues);
    this.fg.updateValueAndValidity();
    this.fg.markAsDirty();
  }

  private _getItemByIndex(index: number | undefined): ParameterValue {
    if (index == undefined || index < 0) return new ParameterValue
    return ((this.fg.controls['items'] as UntypedFormArray).controls[index].value as ParameterValue);
  }

  private _itemIsUnique(allValues: ParameterValue[], name: string, currentIndex?: number | undefined): boolean {
    let duplicated: boolean = allValues.some((pv, i) => {
      return (i !== currentIndex || currentIndex == undefined) && (pv.name.toLowerCase() == name.toLowerCase());
    })

    return !duplicated;
  }

  private _patchForm(values: ParameterValue[]): void {

    (this.fg.controls['items'] as UntypedFormArray).clear();

    if (values && values.length > 0) {
      values.forEach((item: ParameterValue) => {
        //Adding the controls to the array:
        (this.fg.controls['items'] as UntypedFormArray).push(new UntypedFormGroup({
          name: new UntypedFormControl(item.name),
          value: new UntypedFormControl(item.value),
          nativeType: new UntypedFormControl(item.nativeType),
          isRuntimeParameter: new UntypedFormControl(item.isRuntimeParameter)
        }));
      })
    }
  }
}
