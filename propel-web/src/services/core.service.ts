import { Injectable, NgZone } from '@angular/core';

import { PropelAppError } from "../core/propel-app-error";
import { logger } from "../../../propel-shared/services/logger-service";
import { ErrorHandlerService } from "./error-handler-service";
import { NavigationService } from "./navigation-service";
import { ToasterService } from "./toaster-service";

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
    private injErr: ErrorHandlerService,
    private injNav: NavigationService,
    private injToast: ToasterService) {
    logger.logInfo("CoreService instance created")
    this._init()
  }

  get zone() :NgZone {
    return this.injZone;
  }

  get navigation() :NavigationService {
    return this.injNav;
  }

  get toaster() :ToasterService {
    return this.injToast;
  }
  
  private _init() {
    this.injErr.getErrorHandlerSubscription()
      .subscribe((error: PropelAppError) => {
        this.injToast.showError(error);
    })
  }
}
