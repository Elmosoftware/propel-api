import { ErrorHandler, Injectable, EventEmitter } from '@angular/core';
import { PropelAppError } from "../core/propel-app-error";
import { logger } from "../../../propel-shared/services/logger-service";

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService implements ErrorHandler {

  private errorHandlerEmitter$: EventEmitter<PropelAppError> = new EventEmitter<PropelAppError>();

  constructor() {
    logger.logInfo("CustomErrorHandler instance created");
  }

  getErrorHandlerSubscription(): EventEmitter<PropelAppError> {
    return this.errorHandlerEmitter$;
  }

  /**
   * Implementation of CustomErrorHandler class.
   * @param error Error.
   */
  handleError(error) {
    let e = new PropelAppError(error);

    console.error(`%c [${e.name}]: ${e.message}\nat ${e.timestamp.toISOString()}, (local time:${e.timestamp.toLocaleString()})`, "color: #ff3b3b; font-size: 14px; font-weight: Bold");
    console.dir(e);
    this.errorHandlerEmitter$.emit(e);
  }
}