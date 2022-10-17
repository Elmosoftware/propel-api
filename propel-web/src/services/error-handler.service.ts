import { ErrorHandler, Injectable, EventEmitter } from '@angular/core';
import { PropelError } from '../../../propel-shared/core/propel-error';
import { logger } from "../../../propel-shared/services/logger-service";

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService implements ErrorHandler {

  private errorHandlerEmitter$: EventEmitter<PropelError> = new EventEmitter<PropelError>();

  constructor() {
    logger.logInfo("CustomErrorHandler instance created");
  }

  getErrorHandlerSubscription(): EventEmitter<PropelError> {
    return this.errorHandlerEmitter$;
  }

  /**
   * Implementation of CustomErrorHandler class.
   * @param error Error.
   */
  handleError(error: any) {
    let e = new PropelError(error as Error);

    console.error(`%c [${e.name}]: ${e.message}\r\nat ${e.timestamp.toISOString()}, (local time:${e.timestamp.toLocaleString()})`, "color: #ff3b3b; font-size: 14px; font-weight: Bold");
    console.dir(e);
    this.errorHandlerEmitter$.emit(e);
  }
}