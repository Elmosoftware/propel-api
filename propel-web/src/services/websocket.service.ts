import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

export class WebsocketService<T> {

  private _socket!: WebSocketSubject<T>; //TODO: need to fix, it can actually be null...

  constructor(private url: string) {
  }

  connect(): Observable<T> {
    if (!this._socket || this._socket.closed) {
      this._socket = webSocket({
        url: this.url
      });
    }
    return this._socket;
  }

  close(): void {
    this._socket.complete();
  }

  send(message: T): void {
    this._socket.next(message);
  }
}
