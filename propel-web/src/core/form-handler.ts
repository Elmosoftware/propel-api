import { FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { ValidatorsHelper } from "../core/validators-helper";
import { schemaRepo } from "../../../propel-shared/schema/schema-repository";
import { SchemaDefinition } from '../../../propel-shared/schema/schema-definition';
import { Entity } from '../../../propel-shared/models/entity';

/**
 * Utility class helping with common operation with Reactive Forms.
 */
export class FormHandler<T extends Entity> {

    private originalValue: T;
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

    /**
     * Constructor.
     * @param entityType Type for the form data. Must inherit from *"Entity"*.
     * @param form Formgroup to handle.
     */
    constructor(entityType: { new (): T }, form: FormGroup) {
        
        let schemaDef: Readonly<SchemaDefinition> = schemaRepo.getEntitySchemaByName(entityType.name); 
        this._form = form;

        //Because T extends Entity, we can add here the ID safely:
        this._form.addControl("_id", new FormControl("", []));

        //If the schema has audit fields, we can add them here too:
        if (schemaDef.auditFieldsList.length > 0) {
            schemaDef.auditFieldsList.forEach((field) => {
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
     * @param id Entity Id
     */
    setId(id: string): void {
        this.form.controls._id.patchValue(id);
    }

    /**
     * Returns the entity ID.
     */
    getId(): string {
        return this.form.controls._id.value;
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