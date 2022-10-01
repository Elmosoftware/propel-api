import { ValidatorFn, AbstractControl, FormGroup, FormArray } from '@angular/forms';
import { SharedSystemHelper } from '../../../propel-shared/utils/shared-system-helper';

import { UIHelper } from 'src/util/ui-helper';
import { Utils } from '../../../propel-shared/utils/utils';

const DEFAULT_PATTERN_MESSAGE: string = "The entered value is not valid."
const DEFAULT_CONFIRMATION_FIELDS_EQUALITY_MESSAGE: string = "Both values must match."

/**
 * Reactive Froms validation helper.
 */
export class ValidatorsHelper {

  constructor() {
  }

  /**
   * Prevents to have less that the specified amount of items in an array property.
   * Is identical to "min" validator, but only for arrays in order to have specific 
   * array error messages.
   * @param min Minimum amount of items required.
   */
  static minItems(min: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      let ret: any = null;

      if (control.value && Array.isArray(control.value) && control.value.length < min) {
        ret = {
          'minItems': {
            value: control.value,
            requiredLength: min,
            actualLength: control.value.length
          }
        }
      }

      return ret;
    };
  }

  /**
   * Enforce to have no more than the specified amount of items in an array property.
   * Is identical to "max" validator, but only for arrays in order to have specific 
   * array error messages.
   * @param max Maximum amount of items allowed.
   */
  static maxItems(max: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      let ret: any = null;

      if (control.value && Array.isArray(control.value) && control.value.length > max) {
        ret = {
          'maxItems': {
            value: control.value,
            requiredLength: max,
            actualLength: control.value.length
          }
        }
      }

      return ret;
    };
  }

  /**
   * Validator specific for Fully qualified domain names.
   */
  static FQDN(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      let ret: any = null;
      let expression: RegExp = /^([a-zA-Z0-9._-])+$/ig

      if (!expression.test(String(control.value))) {
        ret = {
          'FQDN': {
            value: control.value
          }
        }
      }

      return ret;
    };
  }

  /**
   * Validator specific for only number fields.
   */
  static anyNumber(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      let ret: any = null;

      if (control.value != "" && !(!isNaN(parseFloat(control.value)) && isFinite(control.value))) {
        ret = {
          'anyNumber': {
            value: control.value
          }
        }
      }

      return ret;
    };
  }

  /**
   * Validator specific for date fields in format ISO8601.
   */
  static anyDate(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      let ret: any = null;

      if (control.value && !SharedSystemHelper.isValidDate(control.value)) {
        ret = {
          'anyDate': {
            value: control.value
          }
        }
      }

      return ret;
    };
  }

  static searchableText(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      let ret: any = null;

      if (control.value && !Utils.isQuotedString(control.value) &&
        UIHelper.tokenizeAndStem(control.value).length == 0) {
        ret = {
          'searchableText': {
            value: control.value
          }
        }
      }

      return ret;
    };
  }

  /**
   * Validator specific for RegExp patterns allowing to deliver a specific error message.
   */
  static pattern(pattern: RegExp, message: string = DEFAULT_PATTERN_MESSAGE): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      let ret: any = null;

      if (!String(control.value).match(pattern)) {
        ret = {
          'pattern': {
            value: control.value,
            message: (message) ? String(message) : DEFAULT_PATTERN_MESSAGE
          }
        }
      }

      return ret;
    };
  }

  /**
   * This validator is created to validate fixed length strings like codes of any types, 
   * (postal, etc.)
   */
  static exactLength(length: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      let ret: any = null;

      if (String(control.value).length != length) {
        ret = {
          'exactLength': {
            value: control.value,
            actualLength: String(control.value).length,
            expectedLength: length
          }
        }
      }

      return ret;
    };
  }


  /**
   * Validator specific to test fields equality. This is useful for email or password confirmation fields
   * @param fieldName Field name
   * @param confirmationFieldName The name of the fieldthat holds the confirmation value.
   * @param message Optional error message.
   */
  static fieldsEquality(fieldName: string, confirmationFieldName: string,
    message: string = DEFAULT_CONFIRMATION_FIELDS_EQUALITY_MESSAGE): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      let ret: any = null;
      let parent: FormGroup | FormArray = control.parent;
      let value: string = parent.controls[fieldName].value;
      let confValue: string = parent.controls[confirmationFieldName].value;

      if (value !== confValue) {
        ret = {
          'fieldsEquality': {
            value: control.value,
            message: (message) ? String(message) : DEFAULT_CONFIRMATION_FIELDS_EQUALITY_MESSAGE
          }
        }
      }

      return ret;
    };
  }

  /**
   * Returns the validation error text for the supplied control.
   * Thi methis returns an empty string if "control" is a null reference or is not invalid.
   * @param control Control
   */
  static getErrorText(control: AbstractControl): string {
    let ret: string = "";

    if (!control) return ret;
    if (!control.invalid) return ret;
    if (!control.errors) return ret;
    if (!(control.dirty || control.touched)) return ret;

    //Standard Validators:
    if (control.errors.required) {
      ret = `This information is required in order to continue.`;
    }
    else if (control.errors.min && control.touched) {
      ret = `The minimum allowed value for this field is "${control.errors.min.min}".`
    }
    else if (control.errors.max && control.touched) {
      ret = `The maximum allowed value for this field is "${control.errors.max.max}".`
    }
    else if (control.errors.minlength && control.touched) {
      ret = `This must be at least ${control.errors.minlength.requiredLength} characters long. 
          (${control.errors.minlength.requiredLength - control.errors.minlength.actualLength} more needed).`
    }
    else if (control.errors.maxlength && control.touched) {
      ret = `This can't be longer than ${control.errors.maxlength.requiredLength}. 
          (Need to remove at least ${control.errors.maxlength.actualLength - control.errors.maxlength.requiredLength} characters).`
    }
    //Custom Validators:
    else if (control.errors.minItems && control.touched) {
      if (control.errors.minItems.requiredLength == 1) {
        ret = "You need to add at least 1 item to the list."
      }
      else {
        ret = `You need to add at least ${control.errors.minItems.requiredLength} items to the list.
            (${control.errors.minItems.requiredLength - control.errors.minItems.actualLength} extra item(s) needed).`
      }
    }
    else if (control.errors.maxItems && control.touched) {
      if (control.errors.maxItems.requiredLength == 1) {
        ret = "You can't add more than one item to this list."
      }
      else {
        ret = `You can add a maximum of ${control.errors.maxItems.requiredLength} items to the list.
            You Need to remove at least ${control.errors.maxItems.actualLength - control.errors.maxItems.requiredLength} item(s).`
      }
    }
    else if (control.errors.FQDN && control.touched) {
      ret = "The fully Qualified Domain Name entered, doesn't seem to be valid. Please check that meets the required format. (e.g.: myserver.mydomain.com)"
    }
    else if (control.errors.anyNumber && control.touched) {
      ret = "Only numeric values are allowed."
    }
    else if (control.errors.anyDate && control.touched) {
      ret = "The date is not valid, Please recall dates need to be in ISO-8601 format."
    }
    else if (control.errors.searchableText && control.touched) {
      ret = "We didnt find any searchable words in the supplied text. If you want to do a strict search, please surround the text by quotes."
    }
    else if (control.errors.pattern && control.touched) {
      ret = control.errors.pattern.message
    }
    else if (control.errors.exactLength && control.touched) {
      let diff: number = control.errors.exactLength.actualLength - control.errors.exactLength.expectedLength;
      let exceeded: boolean = diff > 0;
      ret = `Expected exactly ${control.errors.exactLength.expectedLength} characters. You have ${Math.abs(diff)} character(s) ${(exceeded) ? "more" : "less"} than expected.`
    }
    else if (control.errors.fieldsEquality && control.touched) {
      ret = control.errors.fieldsEquality.message
    }

    return ret;
  }
}