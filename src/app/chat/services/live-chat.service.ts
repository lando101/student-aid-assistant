
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Chat } from '../components/live-chat/live-chat.component';

@Injectable({
  providedIn: 'root'
})
export class LiveChatService {
  private webSocket: WebSocket | undefined;
  private messagesSubject: Subject<string>;
  public messages$: Observable<any>;

  constructor() {
    this.messagesSubject = new Subject<any>();
    this.messages$ = this.messagesSubject.asObservable();
  }

  connect(): void {
    this.webSocket = new WebSocket('ws://localhost:3000/api/chat');

    this.webSocket.onmessage = (event) => {
      // console.log('event', event.data)
      // this.messagesSubject.next(event.data);
      console.log('WebSocket message event:', event.data);

      try {
        // Parse the JSON string to an object
        const messageObject = JSON.parse(event.data);

        // Now, messageObject is a JavaScript object, and you can use it as needed.
        this.messagesSubject.next(messageObject);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.webSocket.onerror = (event) => {
      console.error('WebSocket error:', event);
    };

    this.webSocket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.webSocket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  sendMessage(message: Chat[]): void {
    if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
      const messageObject = { role: "user", content: message };
      this.webSocket.send(JSON.stringify(message));
    }
  }


  disconnect(): void {
    if (this.webSocket) {
      this.webSocket.close();
    }
  }
}
