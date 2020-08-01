import { Injectable, NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser'
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { PropelAppError } from "../core/propel-app-error";
import { logger } from "../../../propel-shared/services/logger-service";
import { ErrorHandlerService } from "./error-handler.service";
import { NavigationService } from "./navigation.service";
import { ToasterService } from "./toaster.service";
import { RunnerService } from './runner.service';
import { DialogService } from "./dialog.service";
import { DataService } from "./data.service";
import { environment } from "../environments/environment";
import { StandardDialogConfiguration } from 'src/app/dialogs/standard-dialog/standard-dlg.component';
import { FormHandler } from 'src/core/form-handler';
import { DialogResult } from 'src/core/dialog-result';
import { PSParametersInferrerService } from './ps-parameters-inferrer.service';

/**
 * This core class help inject common services to the app. 
 * Improving maintenability by reducing the amount of injected services on each component. This includes services that 
 * provide common and broadly used functionality like Authentication, Global subscriptions, toasters and also angular 
 * and 3rd party services.
 */
@Injectable({
  providedIn: 'root'
})
export class CoreService {

  constructor(
    private injZone: NgZone,
    private injTitle: Title,
    private injErr: ErrorHandlerService,
    private injNav: NavigationService,
    private injToast: ToasterService,
    private injRun: RunnerService,
    private injDlg: DialogService,
    private injData: DataService,
    private injInfer: PSParametersInferrerService) {
    logger.logInfo("CoreService instance created")
    this._init()
  }

  get zone(): NgZone {
    return this.injZone;
  }

  get navigation(): NavigationService {
    return this.injNav;
  }

  get toaster(): ToasterService {
    return this.injToast;
  }

  get runner(): RunnerService {
    return this.injRun;
  }

  get dialog(): DialogService {
    return this.injDlg;
  }

  get data(): DataService {
    return this.injData;
  }

  get psParametersinferrer(): PSParametersInferrerService {
    return this.injInfer;
  }

  getPageTitle(): string {
    return this.injTitle.getTitle();
  }

  setPageTitle(value: any | string, showVersion: boolean = false) {
    let title: string = ""
    let ver: boolean = showVersion;

    if (value && value.title) {
      title = String(value.title);
    }
    else if (typeof value == "string") {
      title = value;
    }

    this.injTitle.setTitle(`${environment.appName} v${environment.appVersion}${(title) ? " - " + title : ""}`);
  }

  /**
   * If the form is dirty, calling this method when a page redirection occurs will display a 
   * dialog so the user can choose if is ok the data to be discarded.
   * @param fh FormHandler instance with the current form status.
   */
  dataChanged(fh: FormHandler<any>): boolean | Observable<boolean> | Promise<boolean> {

    //If some of the data has been modified but not saved yet:
    if (fh && fh.form && fh.form.dirty) {

      return this.injDlg.showConfirmDialog(new StandardDialogConfiguration(
        "Changes will be discarded!",
        `You have unsaved changes that will be lost if you continue.`,
        "Yes, please discard this changes", "No, i would like to continue editing."))
        .pipe(
          map((value: DialogResult<any>) => {
            //If the user clicks first button, means we can deactivate the component even loosing data:
            return (value.button == 1)
          })
        );
    }
    else {
      //If there is no modified data, we can deactivate the component safely:
      return true;
    }
  }

  private _init() {
    this.injErr.getErrorHandlerSubscription()
      .subscribe((error: PropelAppError) => {
        this.injToast.showError(error);
      })
  }
}
