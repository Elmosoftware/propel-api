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

  private _socket: WebsocketService<WebsocketMessage<ExecutionStats>>

  constructor(private security: SecurityService) {

  }

  /**
   * Execute the specified workflow.
   * @param workflowId Workflow ID
   */
  execute(workflowId: string): Observable<WebsocketMessage<ExecutionStats>> {

    let rem: number = this.security.sessionData.remainingLifetimePercentage

    if (rem > TOKEN_EXPIRATION_TOLERANCE) {
      return this.createSocket(workflowId);
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
            return this.createSocket(workflowId)
          })
        )
    }
  }

  /**
   * Cancel the workflow execution.
   * @param kill Indicates if the execution need to stop immediattely by killing the script executing 
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

  private createSocket(workflowId: string): Observable<WebsocketMessage<ExecutionStats>> {
    let url: string;
    let query: URLSearchParams = new URLSearchParams();

    //Appending the access token in the querystring, sadly the only way we can 
    //send auth data using Websockets:
    if (this.security.isUserLoggedIn) {
      query.append(ACCESS_TOKEN_QUERYSTRING_KEY, `${BEARER_PREFIX}${this.security.sessionData.accessToken}`);
    }

    url = HttpHelper.buildURL(Protocol.WebSocket, env.api.baseURL,
      [RunEndpoint, workflowId], query);
    this._socket = new WebsocketService<any>(url);

    return this._socket.connect();
  }
}
