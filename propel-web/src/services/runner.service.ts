import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { from, Observable, throwError } from 'rxjs';
import { ExecutionStats, WebsocketMessage, InvocationStatus } from '../../../propel-shared/core/websocket-message';
import { environment as env } from 'src/environments/environment';
import { ACCESS_TOKEN_QUERYSTRING_KEY, BEARER_PREFIX } from '../../../propel-shared/core/security-token';
import { SecurityService } from './security.service';
import { HttpHelper, Protocol } from 'src/util/http-helper';
import { TokenRefreshRequest } from '../../../propel-shared/core/token-refresh-request';
import { logger } from '../../../propel-shared/services/logger-service';
import { RunnerServiceData } from '../../../propel-shared/core/runner-service-data';
import { catchError, switchMap, tap } from 'rxjs/operators';

export const RunEndpoint: string = "run"

/**
 * Indicate how much of the total remaining time of the token validity we can run a workflow 
 * safely.
 * If the remaining expiration time is below the indicated percentage, we will force a token 
 * refresh before to start the execution.
 * Be aware we can't recover a Websocket connection from a expired token error.
 * 
 * The value below is expressed as percentage of the token lifetime.
 * @example
 * If the total token lifetime is of 20 minutes, the auto-refresh will take place when the remaining
 * time is below 1 minute or the token is already expired.
 */
const TOKEN_EXPIRATION_TOLERANCE: number = 5;

@Injectable({
  providedIn: 'root'
})
export class RunnerService {

  private _socket!: WebsocketService<WebsocketMessage<ExecutionStats>>

  constructor(private security: SecurityService) {

  }

  /**
   * Execute the specified workflow.
   * @param data RunnerServiceData instance with all the required information to run the Workflow/Quick Task.
   */
  execute(data: RunnerServiceData): Observable<WebsocketMessage<ExecutionStats>> {

    let rem: number = this.security.sessionData.remainingLifetimePercentage

    if (rem > TOKEN_EXPIRATION_TOLERANCE) {
      return this.createSocket(data);
    }
    else {
      logger.logWarn(`Remaining seconds for token expiration is below threshold of ${TOKEN_EXPIRATION_TOLERANCE}%, (${parseFloat(String(rem)).toFixed(2)}%, estimated in ${parseFloat(String(this.security.sessionData.expiringInSeconds/1000)).toFixed(2)}min).
      Proceeding with a token refresh.`)
      return from(this.security.refreshAccessToken(new TokenRefreshRequest(this.security.refreshToken)))
        .pipe(
          catchError((err) => {
            return throwError(err)
          }),
          switchMap(() => {
            return this.createSocket(data)
          })
        )
    }
  }

  /**
   * Cancel the workflow execution.
   * @param kill Indicates if the execution need to stop immediately by killing the script executing 
   * process.
   * By default the execution will stop as soon the current step ends.
   */
  cancel(kill: boolean = false): void {
    let m: WebsocketMessage<ExecutionStats>;

    if (this._socket) {
      m = new WebsocketMessage((kill) ? InvocationStatus.UserActionKill : InvocationStatus.UserActionCancel,
        "", new ExecutionStats());
      this._socket.send(m);
    }
  }

  sendServiceData(data:RunnerServiceData):void {
    let m: WebsocketMessage<ExecutionStats>;
    
    if (this._socket && data) {
      m = new WebsocketMessage(InvocationStatus.ServiceData, JSON.stringify(data), new ExecutionStats());
      this._socket.send(m);
    }
  }

  private createSocket(data: RunnerServiceData): Observable<WebsocketMessage<ExecutionStats>> {
    let url: string;
    let query: URLSearchParams = new URLSearchParams();
    let ret: Observable<WebsocketMessage<ExecutionStats>>;

    //Appending the access token in the querystring, sadly the only way we can 
    //send auth data using Websockets:
    if (this.security.isUserLoggedIn) {
      query.append(ACCESS_TOKEN_QUERYSTRING_KEY, `${BEARER_PREFIX}${this.security.sessionData.accessToken}`);
    }

    url = HttpHelper.buildURL(Protocol.WebSocket, env.api.baseURL, RunEndpoint, query);
    this._socket = new WebsocketService<any>(url);
    ret = this._socket.connect();

    //Sending the execution parameters as soon as the connection is established:
    setTimeout(() => {
      this.sendServiceData(data);
    });

    return ret;
  }
}
