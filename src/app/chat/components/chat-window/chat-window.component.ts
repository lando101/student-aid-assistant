import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Thread } from '../../models/thread.model';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Message } from '../../models/message.model';
import { StorageService } from '../../services/storage.service';
import { MessageListComponent } from '../message-list/message-list.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { cssAirplane } from '@ng-icons/css.gg';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MessageListComponent,
    NgIconComponent
  ],
  providers:[HttpClientModule],
  viewProviders: [provideIcons({ cssAirplane })],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.sass'
})
export class ChatWindowComponent implements OnInit{
  thread$?: Observable<Thread>;
  private destroy$ = new Subject<void>();

  threadId: string = '';
  messages: Message[] = [];
  constructor(private chatService: ChatService, private storageService: StorageService){

  }
  ngOnInit(): void {
    this.createThread();
  }

  // create thread
  createThread(){
    this.thread$ = this.chatService.createThread();

    this.thread$.pipe(takeUntil(this.destroy$)).subscribe(thread => {
      this.threadId = thread.id || '';
    });
  }
  // creating message
  createMessage(message: string){
    const userMessage: Message = {
        assistant_id: undefined,
        content:[{text:{value:message, annotations:[]}}],
        created_at: undefined,
        file_ids: [],
        id: undefined,
        metadata: {},
        object: undefined,
        role: "user",
        run_id: undefined,
        thread_id: this.threadId
    };

    this.messages.unshift(userMessage);

    this.chatService.createMessage(message).subscribe(
      response => {
        console.log('Message sent response', response);
        this.runAssistant('you are a assistant that is an expert with federal student aid in the united states. only answer questions related to federal student aid. ') // update this to say "address user as first name last name"
      },
      error => {
        alert('Error creating message');
      }
    )
    // .subscribe({
    //   next(data) {
    //     console.log('Message sent response', data);
    //     this.runAssistant()
    //   },
    //   error(err) {
    //     alert('Error creating message');
    //   }
    // })
  }

  // run assistant
  runAssistant(instructions?: string){
    this.chatService.runAssistant(instructions).subscribe(
      response => {
        console.log('Assistant run response:', response);
        if(response.id){
          this.checkRunStatus(response.id)
        } else{
          alert('no id')
        }
      },
      error => {
        alert('Error running assistant')
      }
    )
  }

  // check status :: for 10 seconds check for status STOP if status is completed :: then get messages list
  checkRunStatus(runId: string){
    const duration = 10 * 1000; // 10 seconds
    const startTime = Date.now();

    this.chatService.pollStatus(runId).subscribe(
      response => {
        console.log('Status:', response.status);
        if(response.status === 'completed' || Date.now() - startTime > duration) {
          // get message list if completed
          console.log('Status: (done)', response.status);
          this.chatService.listMessages().subscribe(
            response => {
              console.log('Messages:', response)
              this.updateMessages(response)
            },
            error => {
              alert('Error getting messages')
            }
          )
        }
      },
      error => {
        alert('Error getting run status')
      }
    )
  }

  // update message list
  updateMessages(newMessages: Message[]): void {
    if(this.messages.length === 0){
      this.messages = newMessages
    }else {
      // Assuming newMessages are sorted with the newest first
      for (const message of newMessages) {
        if (!this.messages.some(m => m.id === message.id)) {
          this.messages.unshift(message); // Prepend new messages
        }
      }
    }
    console.log('messages list:', this.messages)
  }

  // delete thread
  deleteThread(){
    this.chatService.deleteThread().subscribe(
      response=>{
        this.storageService.removeItem('thread') // removing thread from local storage
        this.createThread()
        this.messages = [];
      },
      error=>{
        alert('Error deleting thread')
      }
    )
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
