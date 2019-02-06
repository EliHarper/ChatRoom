import { Component } from '@angular/core';
import { SocketService } from './socket.service';
import { Message } from 'src/models/message.model';
import { elementStart } from '@angular/core/src/render3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public messages: Array<Message>;
  public prevMessages: Array<Message>;
  public chatBox: string;

  public constructor(private socket: SocketService) {
    this.messages = [];
    this.prevMessages = [];
    this.chatBox = "";
  }

  public ngOnInit() {
    this.socket.getEventListener().subscribe(event => {
      if (event.type == "message") {
        let data = event.data.Content;
        if(event.data.Sender) {
          data = event.data.Sender + ": " + data;
          this.socket.post(event.data).subscribe(id => {
            console.log(event.data)
            event.data.ID = id;
            this.messages.push(<Message>(event.data));
          })
        }
      }
      if(event.type == "close") {
        var newMsg = new Message();
        newMsg.Content = "/The socket connection has been closed.";
        this.messages.push(newMsg)
      }
      if(event.type == "open") {
        this.socket.load().subscribe(elements => {
          this.prevMessages = elements;
        })
        var newMsg = new Message();
        newMsg.Content = "/The socket connection has been established.";
        this.messages.push(newMsg)
      }
    })
  }

  public ngOnDestroy() {
    this.socket.close();
  }
  
  public send() {
    console.log(this.chatBox)
    if (this.chatBox) {
      console.log("send() being called")
      this.socket.send(this.chatBox);
      this.chatBox = "";
    }
  }

  public isSystemMessage(message: string) {
    if (message) {
      return message[0] == "/" ? "<strong>" + message.substring(1) + "</strong>" : null;
    }
  }
}
