import { Injectable, NgZone } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { PropelError } from '../../../propel-shared/core/propel-error';
import { logger } from "../../../propel-shared/services/logger-service";

const STDERRMSG = "Something wrong happened. Please retry the operation later.";
const DEFAULT_TOAST_ERROR_DURATION:number = 6000;
const DEFAULT_TOAST_WARNING_DURATION:number = 6000;

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
    showError(messageOrError: string | PropelError | Error = STDERRMSG,
        title: string = "There was an error ...") {

        this.zone.run(() => {
            try {
                let e: PropelError;
                let isWarning: boolean = false;

                if (typeof messageOrError == "object") {

                    e = Object.assign({}, (messageOrError as PropelError));

                    if (e.userMessage) {
                        messageOrError = e.userMessage;
                        title = "Please verify ...";
                        isWarning = (e.errorCode && e.errorCode.isWarning);
                    }
                    else if (e.isHTTPError) {
                        if (Number(e.httpStatus) == 400) {
                            messageOrError = "Seems like the last operation failed because of the provided data. Please verify the submitted data and do the required changes before to retry.";
                            title = "Data issues ..."
                        }
                        else {
                            messageOrError = "Please verify your internet connectivity. We have issues connecting to remote server.";
                            title = "Connectivity issue ..."
                        }                        
                    }
                    else if (e.isWSError) {
                        messageOrError = "We got disconnected unexpectedly. The operation will continue anyway, please check later the results.";
                        title = "Connectivity issue ..."
                    }
                    else { //For any other kind of error:
                        messageOrError = STDERRMSG;
                    }
                }
                else if (typeof messageOrError !== "string") {
                    messageOrError = STDERRMSG;
                }

                if (isWarning) {
                    this.toastr.warning(String(messageOrError), title, {
                        disableTimeOut: false,
                        timeOut: DEFAULT_TOAST_WARNING_DURATION
                      });
                }
                else {
                    this.toastr.error(String(messageOrError), title, {
                        disableTimeOut: false,
                        timeOut: DEFAULT_TOAST_ERROR_DURATION
                      });
                }               
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