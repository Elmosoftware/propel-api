import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

//Shared:
import { logger } from '../../../propel-shared/services/logger-service';

//Dialog Components:
import { StandardDialogComponent, StandardDialogConfiguration } from "../app/dialogs/standard-dialog/standard-dlg.component";

@Injectable()
export class DialogService {

    constructor(public dialog: MatDialog) {
        logger.logInfo("DialogService instance created")
    }

    showConfirmDialog(options: StandardDialogConfiguration): Observable<any> {

        let dialogRef = this.dialog.open(StandardDialogComponent, { data: options });

        return dialogRef.afterClosed();
    }
}
