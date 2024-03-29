import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { schemaRepo } from "../../../propel-shared/schema/schema-repository";
import { SchemaDefinition } from '../../../propel-shared/schema/schema-definition';
import { DataEndpointActions } from 'src/services/data.service';

/**
 * Utility class helping with common operation with Reactive Forms.
 */
export class FormHandler<T> {

    private originalValue!: T;
    private schemaDef: Readonly<SchemaDefinition>;
    private _form: UntypedFormGroup

    /**
     * Returns the form instance.
     */
    get form(): UntypedFormGroup {
        return this._form;
    }

    /**
     * Returns the current form value.
     */
    get value(): T {
        return this._form.getRawValue();
    }

    /**
     * Return the values that was set before any change made in the form by the user.
     */
    get previousValue(): T {
        return this.originalValue;
    }

    /**
     * Returns a boolean value that indicates if T is an entity. (Mean, has an ID that identifies 
     * it uniquely in the Databse storage system).
     */
    get hasId(): boolean {
        return this.schemaDef.isEntity;
    }

    /**
     * Constructor.
     * @param entityType Type for the form data. Must inherit from *"Entity"*.
     * @param form Formgroup to handle.
     */
    constructor(entityType: DataEndpointActions | string, form: UntypedFormGroup) {
        this.schemaDef = schemaRepo.getSchemaByName(entityType.toString()); 
        this._form = form;

        if (this.schemaDef.isEntity) {
            this._form.addControl("_id", new UntypedFormControl("", []));
        }

        //If the schema has audit fields, we can add them here too:
        if (this.schemaDef.auditFieldsList.length > 0) {
            this.schemaDef.auditFieldsList.forEach((field) => {
                this._form.addControl(field, new UntypedFormControl({ value: "", disabled: true }, []));
            })
        }
    }

    /**
     * Set a new value for the form.
     * @param value new value to set for the form. This will restart the form to a pristine state.
     */
    setValue(value: T): void {
        this.originalValue = value;
        // this.form.patchValue(Object.assign({}, value));
        this.form.patchValue(value as { [key: string]: any; });
        this.form.markAsPristine();
        this.form.markAsUntouched();
    }

    /**
     * Set the entity id. This need to be called after save the entity data in order to allow 
     * edit the just created entity.
     * If the item has no id, no action is done neither an error will be throw.
     * @param id Entity Id
     */
    setId(id: string): void {
        if (this.hasId) {
            this.form.controls['_id'].patchValue(id);
        }        
    }

    /**
     * Returns the entity ID.
     * If there is no id and empty string will be always returned.
     */
    getId(): string {
        let ret: string =  "";

        if (this.hasId) {
            ret = this.form.controls['_id'].value;
        }

        return ret;        
    }

    /**
     * Reset the form to the previous known value.
     */
    resetForm() {
        this.setValue(this.originalValue);
        this.form.markAsPristine();
        this.form.markAsUntouched();
    }
}