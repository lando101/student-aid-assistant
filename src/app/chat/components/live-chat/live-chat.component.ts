import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LiveChatService } from '../../services/live-chat.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatCompletionResponse } from '../../models/chatcompletion.model';
export interface Chat {
  role: string;
  content: string;
}

@Component({
  selector: 'app-live-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // templateUrl: './live-chat.component.html',
  template: `
    <div *ngFor="let message of chatHistory">
      {{ message.content }}
    </div>
    <!-- <div>{{content_live}}</div> -->
    <input [(ngModel)]="userInput" (keyup.enter)="sendMessage()">
    <button (click)="sendMessage()">Send</button>
  `,
  styleUrl: './live-chat.component.sass'
})
export class LiveChatComponent implements OnInit, OnDestroy {
  userInput!: string;
  messages: string[] = [];
  chatHistory: Chat[] | null = null;
  private messagesSubscription!: Subscription;
  enabled: boolean = true;
  content: string = ''
  content_live: string = '';

  constructor(private chatService: LiveChatService) {}

  ngOnInit(): void {
    this.chatService.connect();
    this.messagesSubscription = this.chatService.messages$.subscribe((message: ChatCompletionResponse) => {
      // let content: string = '';
      if(this.chatHistory && this.chatHistory[this.chatHistory.length -1].role === 'assistant'){
        if(message.choices) {
          const deltaContent = message.choices[0]?.delta?.content ?? '';
          this.content_live += deltaContent; // Append new content
          if(this.chatHistory){
            const deltaContent = message.choices[0]?.delta?.content ?? '';
            this.chatHistory[this.chatHistory.length - 1].content += deltaContent; // Append new content
          }
          if(message.choices[0].finish_reason === "stop") {
            this.enabled = true;
          }
        }
        // console.log(this.chatHistory)
      }
    });
  }

  sendMessage(): void {
    this.enabled = false;

    if(this.chatHistory === null){
      this.chatHistory = [{role: 'user', content: this.userInput}]
    } else {
      this.chatHistory?.push({role: 'user', content: this.userInput})
    }
    // console.log(this.chatHistory)

    this.chatService.sendMessage(this.chatHistory); // send to api


    this.chatHistory?.push({role: 'assistant', content: ''}); // add slot for assistant response
    this.userInput = '';

  }

  ngOnDestroy(): void {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
    this.chatService.disconnect();
  }
}
