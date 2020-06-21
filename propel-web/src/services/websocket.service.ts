import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

export class WebsocketService<T> {

  private _socket: WebSocketSubject<T>;

  constructor(private url: string) {
  }

  connect(): Observable<T> {
    this._socket = webSocket({
      url: this.url //"ws://localhost:3000/api/run/dddd"
      // ,
      // deserializer: (data) => {
      //     console.log(data);
      //  }
    });
    return this._socket
  }

  close(): void {
    this._socket.complete();
  }

  send(message: T): void {
    this._socket.next(message);
  }
}
