import { Injectable, EventEmitter } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Message } from "src/models/message.model";

@Injectable()
export class SocketService {

  private socket: WebSocket
  private listener: EventEmitter<any> = new EventEmitter();

  constructor(private http: HttpClient) {
    this.socket = new WebSocket("ws://192.168.2.110:12345/ws");
    this.socket.onopen = event => {
      this.listener.emit({"type": "open", "data": event});
    }
    this.socket.onclose = event => {
      this.listener.emit({"type": "close", "data": event});
    }
    this.socket.onmessage = event => {
      this.listener.emit({"type": "message", "data": JSON.parse(event.data)});
    }
  }

  public send(data: string) {
    this.socket.send(data);
  }

  public close() {
    this.socket.close();
  }

  public getEventListener() {
    return this.listener;
  }

  public load(): Observable<Message[]> {
    return this.http.get<Message[]>("http://192.168.2.110:8000/load");
  }

  public post(message: Message): Observable<Object> {
    console.log("In socket service: post(message: any)")
    console.log(message)
    let headers = new HttpHeaders().set('Content-Type', 'text/plain');
    return this.http.post(`http://192.168.2.110:8000/send`, message, { headers: headers})
  }

}
