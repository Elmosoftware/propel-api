import { FormGroup, FormControl } from '@angular/forms';
import { schemaRepo } from "../../../propel-shared/schema/schema-repository";
import { SchemaDefinition } from '../../../propel-shared/schema/schema-definition';

/**
 * Utility class helping with common operation with Reactive Forms.
 */
export class FormHandler<T> {

    private originalValue: T;
    private schemaDef: Readonly<SchemaDefinition>;
    private _form: FormGroup

    /**
     * Returns the form instance.
     */
    get form(): FormGroup {
        return this._form;
    }

    /**
     * Returns the current form value.
     */
    get value(): T {
        return this._form.getRawValue();
    }

    get hasId(): boolean {
        return this.schemaDef.isEntity;
    }

    /**
     * Constructor.
     * @param entityType Type for the form data. Must inherit from *"Entity"*.
     * @param form Formgroup to handle.
     */
    constructor(entityType: { new (): T }, form: FormGroup) {
        // this.schemaDef = schemaRepo.getEntitySchemaByName(entityType.name); 
        this.schemaDef = schemaRepo.getSchemaByName(entityType.name); 
        this._form = form;

        if (this.schemaDef.isEntity) {
            this._form.addControl("_id", new FormControl("", []));
        }

        //If the schema has audit fields, we can add them here too:
        if (this.schemaDef.auditFieldsList.length > 0) {
            this.schemaDef.auditFieldsList.forEach((field) => {
                this._form.addControl(field, new FormControl({ value: "", disabled: true }, []));
            })
        }
    }

    /**
     * Set a new value for the form.
     * @param value new value to set for the form. This will restart the form to a pristine state.
     */
    setValue(value: T): void {
        this.originalValue = value;
        this.form.patchValue(Object.assign({}, value));
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
            this.form.controls._id.patchValue(id);
        }        
    }

    /**
     * Returns the entity ID.
     * If there is no id and empty string will be always returned.
     */
    getId(): string {
        let ret: string =  "";

        if (this.hasId) {
            ret = this.form.controls._id.value;
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