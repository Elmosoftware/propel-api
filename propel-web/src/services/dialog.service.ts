import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

//Shared:
import { logger } from '../../../propel-shared/services/logger-service';
import { WorkflowStep } from '../../../propel-shared/models/workflow-step';

//Dialog Components:
import { DialogResult } from "../core/dialog-result";
import { StandardDialogComponent, StandardDialogConfiguration } from "../app/dialogs/standard-dialog/standard-dlg.component";
import { WorkflowStepDialogComponent } from 'src/app/dialogs/workflow-step-dlg/workflow-step-dlg.component';
import { ParameterValue } from '../../../propel-shared/models/parameter-value';
import { CustomFieldDialogComponent } from 'src/app/dialogs/custom-field-dlg/custom-field-dlg.component';
import { CustomValueDialogComponent, CustomValueDialogData } from 'src/app/dialogs/custom-value-dlg/custom-value-dlg.component';

@Injectable()
export class DialogService {

    constructor(public dialog: MatDialog) {
        logger.logInfo("DialogService instance created")
    }

    /**
     * Open a standard dialog with configurable buttons.
     * @param options Standard dialog options. 
     */
    showConfirmDialog(options: StandardDialogConfiguration): Observable<DialogResult<any>> {

        let dialogRef = this.dialog.open(StandardDialogComponent, { data: options });

        return dialogRef.afterClosed()
            .pipe(
                map((value) => {
                    //I find difficult to capture ESC key or a click on the backdrop. Both will 
                    //close the dialog,so i'm patching here the result object:
                    if (!value) return new DialogResult<any>(0, null)
                    else return value;
                })
            )
    }

    /**
     * Open a dialog to enable edit a Workflow step.
     * @param options Step to edit.
     */
    showWorkflowStepDialog(options: WorkflowStep): Observable<DialogResult<any>> {

        let dialogRef = this.dialog.open(WorkflowStepDialogComponent, {
            data: options,
            width: "660px"
        });

        return dialogRef.afterClosed()
            .pipe(
                map((value) => {
                    if (!value) return new DialogResult<any>(0, null)
                    else return value;
                })
            )
    }

    /**
     * Open a dialog to enable edit a Workflow step.
     * @param options Step to edit.
     */
    showCustomFieldDialog(options: ParameterValue): Observable<DialogResult<any>> {

        let dialogRef = this.dialog.open(CustomFieldDialogComponent, {
            data: options,
            width: "660px"
        });

        return dialogRef.afterClosed()
            .pipe(
                map((value) => {
                    if (!value) return new DialogResult<any>(0, null)
                    else return value;
                })
            )
    }

    showCustomValueDialog(value?: CustomValueDialogData): Observable<DialogResult<any>> {

        let dialogRef = this.dialog.open(CustomValueDialogComponent, {
            data: value,
            width: "660px"
        });

        return dialogRef.afterClosed()
            .pipe(
                map((value) => {
                    if (!value) return new DialogResult<any>(0, null)
                    else return value;
                })
            )
    }
}
