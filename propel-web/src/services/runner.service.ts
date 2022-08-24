import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { Observable } from 'rxjs';
import { InvocationMessage, InvocationStatus } from '../../../propel-shared/core/invocation-message';
import { environment } from 'src/environments/environment';
import { ACCESS_TOKEN_QUERYSTRING_KEY, BEARER_PREFIX } from '../../../propel-shared/core/security-token';
import { SecurityService } from './security.service';

@Injectable({
  providedIn: 'root'
})
export class RunnerService {

  private _socket: WebsocketService<InvocationMessage>

  constructor(private security: SecurityService) {

  }

  /**
   * Execute thespecified workflow.
   * @param workflowId Workflow ID
   */
  execute(workflowId: string): Observable<InvocationMessage> {
    this._socket = new WebsocketService<any>(this.buildURL(workflowId));

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

  private buildURL(workflowId: string) {
    let url: string = `ws://${environment.api.url}${environment.api.endpoint.run}${workflowId}`

    if (this.security.isUserLoggedIn) {
      url += `?${ACCESS_TOKEN_QUERYSTRING_KEY}=${BEARER_PREFIX}${this.security.sessionData.accessToken}`;
    }

    return url
  }
}
