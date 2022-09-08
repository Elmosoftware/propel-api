import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { Observable } from 'rxjs';
import { InvocationMessage, InvocationStatus } from '../../../propel-shared/core/invocation-message';
import { environment as env } from 'src/environments/environment';
import { ACCESS_TOKEN_QUERYSTRING_KEY, BEARER_PREFIX } from '../../../propel-shared/core/security-token';
import { SecurityService } from './security.service';
import { HttpHelper, Protocol } from 'src/util/http-helper';

export const RunEndpoint: string = "run"

@Injectable({
  providedIn: 'root'
})
export class RunnerService {

  private _socket: WebsocketService<InvocationMessage>

  constructor(private security: SecurityService) {

  }

  /**
   * Execute the specified workflow.
   * @param workflowId Workflow ID
   */
  execute(workflowId: string): Observable<InvocationMessage> {
    let url: string;
    let query: URLSearchParams = new URLSearchParams();

    //Appending the access token in the querystring, sadly the only way we can 
    //send auth data using Websockets:
    if (this.security.isUserLoggedIn) {
      query.append(ACCESS_TOKEN_QUERYSTRING_KEY, `${BEARER_PREFIX}${this.security.sessionData.accessToken}`);
    }

    url = HttpHelper.buildURL(Protocol.WebSocket, env.api.baseURL, 
      [ RunEndpoint, workflowId ], query);
    this._socket = new WebsocketService<any>(url);

    return this._socket.connect();
  }

  /**
   * Cancel the workflow execution.
   * @param kill Indicates if the execution need to stop immediattely by killing the script executing 
   * process.
   * By default the execution will stop as soon the current step ends.
   */
  cancel(kill: boolean = false): void {
    let m: InvocationMessage;

    if (this._socket) {
      m = new InvocationMessage((kill) ? InvocationStatus.UserActionKill : InvocationStatus.UserActionCancel, "");
      this._socket.send(m);
    }
  }
}
