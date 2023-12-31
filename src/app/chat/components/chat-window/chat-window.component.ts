import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { Thread } from '../../models/thread.model';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Message } from '../../models/message.model';
import { StorageService } from '../../services/storage.service';
import { MessageListComponent } from '../message-list/message-list.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { cssAirplane, cssTrashEmpty, cssCopy, cssPathTrim, cssCoffee, cssAdd } from '@ng-icons/css.gg';

import { ExamplePromptsComponent } from '../example-prompts/example-prompts.component';
import { PromptsCarouselComponent } from '../prompts-carousel/prompts-carousel.component';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MessageListComponent,
    NgIconComponent,
    ExamplePromptsComponent,
    PromptsCarouselComponent
  ],
  providers:[HttpClientModule],
  viewProviders: [provideIcons({ cssAirplane, cssTrashEmpty, cssCopy, cssPathTrim, cssCoffee, cssAdd })],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.sass'
})
export class ChatWindowComponent implements OnInit{
  @ViewChild('chatbox') chatbox: ElementRef | null = null;

  thread$?: Observable<Thread>;
  private destroy$ = new Subject<void>();

  threadId: string = '';
  messages: Message[] = [];

  messageLoading: boolean = false;
  threadLoading: boolean = false;

  constructor(private chatService: ChatService, private storageService: StorageService){

  }
  ngOnInit(): void {
    this.createThread();

    this.chatService.$messageLoading.subscribe(loading =>{
      this.messageLoading = loading;
      // alert('message loading'+loading)
      console.log('message loading:', loading)
    });

    this.chatService.$threadLoading.subscribe(loading =>{
      this.threadLoading = loading;
    })
  }

  // create thread
  createThread(){
    this.thread$ = this.chatService.createThread();

    this.thread$.pipe(takeUntil(this.destroy$)).subscribe(thread => {
      this.threadId = thread.id || '';
      if(thread.id){
        this.chatService.listMessages().pipe(takeUntil(this.destroy$)).subscribe(messages =>{
          console.log('messages', messages);
          messages = messages.sort((a, b) => a.created_at! - b.created_at!);
          this.messages = messages ? messages:[];
          this.chatService._messages.next(this.messages);
        })
      }
    });
  }
  // creating message
  createMessage(message: string){
    const userMessage: Message = {
        assistant_id: undefined,
        content:[{text:{value:message, annotations:[]}}],
        created_at: this.createUnixTime(),
        file_ids: [],
        id: undefined,
        metadata: {},
        object: undefined,
        role: "user",
        run_id: undefined,
        thread_id: this.threadId
    };
    if(this.chatbox){
      this.chatbox.nativeElement.value = '';
    }

    this.messages.push(userMessage);
    this.chatService._messages.next(this.messages);

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
      this.chatService._messages.next(this.messages);
    }else {
      // Assuming newMessages are sorted with the newest first
      this.messages[this.messages.length - 1] = newMessages[1]; // replacing locally created message with open ai message
      // for (const message of newMessages) {
      //   if (!this.messages.some(m => m.id === message.id)) {
      //     this.messages.unshift(message); // Prepend new messages
      //     this.messages.sort((a, b) => a.created_at! - b.created_at!);
      //   }
      this.messages.push(newMessages[0]);
      this.chatService._messages.next(this.messages);
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
        this.chatService._messages.next(this.messages);
      },
      error=>{
        alert('Error deleting thread')
      }
    )
  }

  createUnixTime(): number{
    // Get the current date and time
    const now = new Date();

    // Convert to Unix timestamp
    const unixTime = Math.floor(now.getTime()/1000);

    return unixTime
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
