import { Injectable, NgZone } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PropelAppError } from "../core/propel-app-error";
import { logger } from "../../../propel-shared/services/logger-service";

/**
 * Helper class for the ngx-toastr component.
 * 
 * This facilitates the implementation of the toaster with the same visual aids in all the app.
 */
@Injectable({
    providedIn: 'root'
})
export class ToasterService {

    constructor(private zone: NgZone,
        private toastr: ToastrService) {
        logger.logInfo("ToasterService instance created")
    }

    /**
     * Shows an error message in a toaster. 
     * @param messageOrError Message to show in the toaster or an Error object containing all the Error details.
     * @param title Optional toaster title.
     */
    showError(messageOrError: string | PropelAppError | Error = "Something wrong happened. Please retry the operation later.",
        title: string = "There was an error ...") {

        this.zone.run(() => {
            try {
                if (typeof messageOrError == "object" && (messageOrError as PropelAppError).userMessage) {
                    messageOrError = (messageOrError as PropelAppError).userMessage;
                }
                else {
                    messageOrError = String(messageOrError);
                }
                this.toastr.error(messageOrError, title);
            } catch (error) {
                logger.logWarn(`There was an error preventing to display a toaster. Error details: "${String(error)}".`)
            }
        });
    }

    /**
     * Shows a success message in a toaster.
     * @param message Message to show in the toaster.
     * @param title Optional toaster title.
     */
    showSuccess(message: string, title = 'Ok!') {
        this.zone.run(() => {
            this.toastr.success(message, title);
        });
    }

    /**
     * Shows an informational message message in a toaster.
     * @param message Message to show in the toaster.
     * @param title Optional toaster title.
     */
    showInformation(message, title = 'Information') {
        this.zone.run(() => {
            this.toastr.info(message, title);
        });
    }

    /**
     * Shows a warning message in a toaster.
     * @param message Message to show in the toaster.
     * @param title Optional toaster title.
     */
    showWarning(message, title = 'Warning!') {
        this.zone.run(() => {
            this.toastr.warning(message, title);
        });
    }
}