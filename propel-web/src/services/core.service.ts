import { Injectable, NgZone } from '@angular/core';
import { Title } from '@angular/platform-browser'

import { PropelAppError } from "../core/propel-app-error";
import { logger } from "../../../propel-shared/services/logger-service";
import { ErrorHandlerService } from "./error-handler.service";
import { NavigationService } from "./navigation.service";
import { ToasterService } from "./toaster.service";
import { RunnerService } from './runner.service';
import { DialogService } from "./dialog.service";
import { DataService } from "./data.service";
import { environment } from "../environments/environment";

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
    private injData: DataService) {
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

  private _init() {
    this.injErr.getErrorHandlerSubscription()
      .subscribe((error: PropelAppError) => {
        this.injToast.showError(error);
      })
  }
}
