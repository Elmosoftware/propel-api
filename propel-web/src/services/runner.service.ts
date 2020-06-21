import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RunnerService {

  private _socket: WebsocketService<any>

  constructor() {

  }

  execute(workflowId: string): Observable<any> {
    this._socket = new WebsocketService<any>("ws://localhost:3000/api/run/dddd");
    return this._socket.connect();
  }

}
