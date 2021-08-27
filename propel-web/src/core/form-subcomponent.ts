import { EventEmitter } from "@angular/core";
import { Observable } from 'rxjs';

export interface FormSubcomponentInterface<T> {

    /**
     * T instance with the form data.
     */
    model: T;

    /**
     * Triggered on every data change made to the model.
     */
    subFormChange: EventEmitter<FormSubcomponentEventData<T>>;

    /**
     * Signal sent from parent componente every time a form reset is required.
     */
    reset: Observable<void>;

    /**
     * Signal sent from parent componente when the data is saved. This indicate to the subform 
     * the model does not contain dirty data.
     */
    saved: Observable<void>;

    /**
     * Boolean value that indicates if the data in the subcomponent is valid.
     */
    isValid: boolean;

    /**
     * Boolen value that indicates if the data in the subcomponent has changed.
     */
    isDirty: boolean;
}

/**
 * An instance of this class will be used in the "subFormChange" event and will provide to the 
 * parent form the updated data in the sub form model and also an attribute indicating the 
 * current validity state. 
 */
export class FormSubcomponentEventData<T> {

    /**
      * T instance with the form data.
      */
    model: T;

    /**
     * Boolean value that indicates if the data in the subcomponent is valid.
     */
    isValid: boolean;

    constructor(model: T, isValid: boolean) {
        this.model = model;
        this.isValid = isValid;
    }
}