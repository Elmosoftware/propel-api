import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { FormHandler } from 'src/core/form-handler';
import { Entity } from '../../../../../propel-shared/models/entity';
import { DialogResult } from 'src/core/dialog-result';
import { PropelError } from '../../../../../propel-shared/core/propel-error';
import { DataEntity } from 'src/services/data.service';

const GROUP_NAME_MIN: number = 3;
const GROUP_NAME_MAX: number = 25;
const CATEGORY_NAME_MIN: number = 3;
const CATEGORY_NAME_MAX: number = 25;

@Component({
  selector: 'app-entity-dlg',
  templateUrl: './entity-dlg.component.html',
  styleUrls: ['./entity-dlg.component.css']
})
export class EntityDialogComponent implements OnInit {

  entityName: string = ""
  fh: FormHandler<Entity>;

  get title(): string {
    return ((this.fh.getId()) ? "Editing" : "New") + " " + this.entityName;
  }

  constructor(public dialogRef: MatDialogRef<EntityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public config: any) {

    if (!config || !config.entityType) {
      throw new PropelError(`EntityDialog component get a wrong config. Config is null or doesn't have the "entityType" attribute.`);
    }

    this.entityName = config.entityType;

    switch (config.entityType) {
      case DataEntity.Group:
        this.fh = new FormHandler(DataEntity.Group, new FormGroup({
          name: new FormControl("", [
            Validators.required,
            Validators.minLength(GROUP_NAME_MIN),
            Validators.maxLength(GROUP_NAME_MAX)
          ])
        }));
        break;
      case DataEntity.Category:
        this.fh = new FormHandler(DataEntity.Category, new FormGroup({
          name: new FormControl("", [
            Validators.required,
            Validators.minLength(CATEGORY_NAME_MIN),
            Validators.maxLength(CATEGORY_NAME_MAX)
          ])
        }));
        break;

        /*
          Add any other dialog form required here.
        */
        
      default:
        throw new PropelError(`There is no defined dialog for entity "${config.entityType.toString()}".`);
    }

    this.fh.setValue(config.data);
  }

  closeDlg(id): void {
    this.dialogRef.close(new DialogResult<any>(id, this.fh.value));
  }

  ngOnInit(): void {
  }
}

export class EntityDialogConfiguration<T extends Entity> {

  constructor(entityType: DataEntity, data: T) {
    this.entityType = entityType
    this.data = data;
  }

  entityType: DataEntity;
  data: T;
}
