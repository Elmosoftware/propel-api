import { ValidatorFn, AbstractControl } from '@angular/forms';

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
        return (control: AbstractControl): {[key: string]: any} | null => {
          let ret: any = null;
    
          if (control.value && Array.isArray(control.value) && control.value.length < min) {
            ret = {
              'minItems': {
                value: control.value, 
                requiredLength: min, 
                actualLength:control.value.length 
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
        return (control: AbstractControl): {[key: string]: any} | null => {
          let ret: any = null;
    
          if (control.value && Array.isArray(control.value) && control.value.length > max) {
            ret = {
              'maxItems': {
                value: control.value, 
                requiredLength: max, 
                actualLength:control.value.length 
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
        return (control: AbstractControl): {[key: string]: any} | null => {
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
       * Returns the validation error text for the supplied control.
       * Thi methis returns an empty string if "control" is a null reference or is not invalid.
       * @param control Control
       */
      static getErrorText(control: AbstractControl): string {
        let ret: string = "";
        
        if (!control) return ret;
        if (!control.invalid) return ret;
        if (!control.errors) return ret;
        if(!(control.dirty || control.touched)) return ret;
        
        //Standard Validators:
        if (control.errors.required) {
          ret = `This information is required in order to continue.`; 
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
            ret = "You need to select at least 1 item from the list."
          }
          else {
            ret = `You need to select at least ${control.errors.minItems.requiredLength} items from the list.
            (${control.errors.minItems.requiredLength - control.errors.minItems.actualLength} extra item(s) needed).`
          }      
        }
        else if (control.errors.maxItems && control.touched) {
          if (control.errors.maxItems.requiredLength == 1) {
            ret = "You can't select more than one item in this list."
          }
          else {
            ret = `You can select a maximum of ${control.errors.maxItems.requiredLength} items from the list.
            (Need to remove at least ${control.errors.maxItems.actualLength - control.errors.maxItems.requiredLength} items).`
          }      
        }
        else if (control.errors.FQDN && control.touched) {
          ret = "The fully Qualified Domain Name entered, doesn't seem to be valid. Please check that meets the required format. (e.g.: myserver.mydomain.com)"
        }
    
        return ret;
      }
}