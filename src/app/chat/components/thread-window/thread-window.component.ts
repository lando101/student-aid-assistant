import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { NgIconComponent } from '@ng-icons/core';
import { Router } from 'express';
import { Subscription, map } from 'rxjs';
import { MessageListComponent } from '../message-list/message-list.component';
import { AssistantService } from '../../services/assistant.service';
import { Message } from '../../models/message.model';
import { UserService } from '../../../core/auth/user.service';
import { Threads, UserProfile } from '../../models/user_profile.model';
import { NgPipesModule, OrderByPipe } from 'ngx-pipes';
import { NgxTypedJsComponent, NgxTypedJsModule } from 'ngx-typed-js';
import { LoaderComponent } from "../../../shared/components/loader/loader.component";
import { ExamplePromptsComponent } from "../example-prompts/example-prompts.component";
import { PromptsCarouselComponent } from "../prompts-carousel/prompts-carousel.component";
import { DeleteDialogComponent } from '../dialogs/delete-dialog/delete-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { LiveMessage, LiveThread, OpenAIMesg } from '../../models/chat.model';
import { LiveChatService } from '../../services/live-chat.service';
import { ChatCompletionResponse } from '../../models/chatcompletion.model';

@Component({
    selector: 'app-thread-window',
    standalone: true,
    templateUrl: './thread-window.component.html',
    styleUrl: './thread-window.component.sass',
    providers: [OrderByPipe],
    imports: [CommonModule, NgIconComponent, MatIconModule, MessageListComponent, NgxTypedJsModule, LoaderComponent, ExamplePromptsComponent, PromptsCarouselComponent, NgPipesModule]
})
export class ThreadWindowComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy{
  @ViewChild('chatbox') chatbox: ElementRef | null = null;
  @ViewChild('typed') typed!: NgxTypedJsComponent;


  chatService = inject(AssistantService);
  userService = inject(UserService);
  orderPipe = inject(OrderByPipe);
  dialog = inject(MatDialog);
  liveChatService = inject(LiveChatService);

  messageLoading = this.chatService.messageLoading();
  activeThread: Threads | null = null
  activeLiveThread: LiveThread | null = null
  private liveMesgSub!: Subscription;

  initMsg = this.chatService.initThreadMsg
  // initMsg = true


  userProfile: UserProfile | null = null;
  userSubscription!: Subscription;

  threadId: string | null = null;
  $route!: Subscription;

  messages: Message[] | null = null; // messages from open ai
  userMessages: Message[] | null = null; // messages saved to user in firebase
  mergedMsgs: Message[] | null = null; // messages saved to user in firebase
  liveMsgs: LiveMessage[] | null = null; // messages saved
  chatHistory: OpenAIMesg[] | null = null; // messages saved

  firebaseMessagesLoading: boolean = false;
  $messages!: Subscription;
  messagesLoading: boolean = false;

  placeholders: string[] = []

  init = true;

  constructor(private route: ActivatedRoute) {
    effect(()=>{
      if(this.init === false){
        // console.log('signal messages', this.chatService.messages())
      }
    });
  }

  ngOnInit(): void {
    this.$route = this.route.params.subscribe((params)=>{
      if(this.threadId) {
        if(this.threadId !== params['threadId']){
          this.reset();
          this.threadId = params['threadId'];
          // if(sub){
          //   sub.unsubscribe()
          // }
        }
      } else {
        this.threadId = params['threadId'];
      }
      this.userSubscription = this.userService.$userProfile.subscribe((user)=>{
        this.userProfile = user;
        // console.log('user', user)
        this.activeLiveThread = this.userProfile?.live_threads?.find((thread)=>thread.thread_id === this.threadId) ?? null;
        this.chatService.activeThread.set(this.activeLiveThread);
        if(this.activeLiveThread?.thread_id){
          this.getLiveMessages(this.activeLiveThread.thread_id)
        }
      })
      if(this.threadId && this.userProfile){
        this.liveChatService.connect();

        this.liveMesgSub = this.liveChatService.messages$.subscribe((message: ChatCompletionResponse) => {
          // let content: string = '';
          if(this.chatHistory && this.chatHistory[this.chatHistory.length -1].role === 'assistant'){
            if(message.choices) {
              const deltaContent = message.choices[0]?.delta?.content ?? '';
              // this.content_live += deltaContent; // Append new content
              if(this.chatHistory){
                const deltaContent = message.choices[0]?.delta?.content ?? '';
                this.chatHistory[this.chatHistory.length - 1].content += deltaContent; // Append new content
                this.liveMsgs![this.liveMsgs!.length - 1].message = this.chatHistory[this.chatHistory.length - 1].content; // Append new content
              }
              if(message.choices[0].finish_reason === "stop") { // add message to user's thread in firebase
                // this.enabled = true;
                let assistant_message = this.liveMsgs![this.liveMsgs!.length - 1];
                assistant_message.id = message.id;
                assistant_message.model = message.model;

                this.userService.addLiveMessage(assistant_message).then(()=>{
                  if(this.activeLiveThread?.thread_id && assistant_message.message){
                    this.userService.updateLiveThread(this.activeLiveThread?.thread_id, 'last_message', assistant_message.message)
                    .then(()=>{
                      this.userService.updateLiveThread(this.activeLiveThread!.thread_id!, 'thread_length', (this.liveMsgs ? this.liveMsgs!.length : 0))
                    })
                  }
                });
              }
            }
            // console.log(this.chatHistory)
          }
        });
        // this.loadAndMergeMessages().then((loading: boolean)=>{
        //   if(!loading){
        //     this.$messages = this.chatService.$messages.subscribe((messages: Message[])=>{
        //       if(this.init === false){
        //         // console.log('new messages', messages)
        //         if(messages.length>0){
        //           const match = this.mergedMsgs?.find((message)=>message.id === messages[0].id);
        //           if(!match){
        //             this.mergedMsgs?.push(messages[0]);
        //             // this.userService.addMessages(messages[0].thread_id ?? '', messages[0])
        //             this.userService.updateThread(messages[0].thread_id!, 'last_message_content', messages[0].content[0].text.value)
        //             this.userService.addMessages(messages[0].thread_id!, messages[0]).then(()=>{ // adding messages to user in firestore
        //               this.userService.addMessages(messages[1].thread_id!, messages[1]);
        //             });
        //           }
        //         }
        //       }
        //     })
        //   }
        // })

      }
    })

  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  ngAfterViewInit(): void {
    // this.messages = this.chatService.messages()
    const initMsg = this.chatService.initThreadMsg();
    setTimeout(() => {
      if(initMsg) {
        this.createMessage(initMsg);
      }
    }, 2000);
  }

  deleteThread(threadId: string) {
    this.userService.removeLiveThread(threadId)
  }

  openDialog(thread: LiveThread | null): void {
    if (thread) {
      const dialogRef = this.dialog.open(DeleteDialogComponent, {
        data: {
          thread_name: thread.thread_name,
          thread_id: thread.thread_id,
          creation_date: thread.creation_date,
        },
      });

      dialogRef.afterClosed().subscribe((result: boolean) => {
        // // console.log('The dialog was closed');
        if (result === true) {
          this.deleteThread(thread.thread_id ?? '');
        }
      });
    } else {
      alert('error deleting thread');
    }
  }

  // create live message
  createLiveMessage(content: string){
    this.chatbox!.nativeElement.value = ''
    const message: LiveMessage = {
      id: null,
      role: 'user',
      message: content,
      time_stamp: new Date().toISOString(),
      model: null,
      thread_id: this.activeLiveThread!.thread_id,
      liked: 0,
      user_feedback: null,
      uid: this.userProfile!.uid
    }
    if(this.liveMsgs === null) {
      this.liveMsgs = [message]
      this.chatHistory = [{role: 'user', content: content}]
    } else {
      this.chatHistory?.push({role: 'user', content: content})
      this.liveMsgs.push(message);
    }

    this.userService.addLiveMessage(message).then(()=>{ // adding message to user profile
      if (this.chatHistory?.length ?? 0 > 30) {
        this.chatHistory = this.chatHistory!.slice(-30);
    }
      console.log('chat history', this.chatHistory)
      this.liveChatService.sendMessage(this.chatHistory!); // then sending message to open ai
      this.chatHistory!.push({role: 'assistant', content: ''}); // add slot for assistant response
      this.liveMsgs!.push({
        id: null,
        role: 'assistant',
        message: '',
        time_stamp: new Date().toISOString(),
        model: null,
        thread_id: this.activeLiveThread!.thread_id,
        liked: 0,
        user_feedback: null,
        uid: this.userProfile!.uid
      })
    })
  }

  // creating message
  createMessage(message: string) {
    const userMessage: Message = {
      assistant_id: undefined,
      content: [{ text: { value: message, annotations: [] } }],
      created_at: this.createUnixTime(),
      file_ids: [],
      id: undefined,
      metadata: {},
      object: undefined,
      role: 'user',
      run_id: undefined,
      thread_id: this.threadId!,
    };
    if (this.chatbox) {
      this.chatbox.nativeElement.value = '';
    }
    if(this.mergedMsgs?.length ?? 0>0){
      this.mergedMsgs!.push(userMessage);
    } else {
      this.mergedMsgs = [userMessage]
    }
    // this.chatService._messages.next(this.mergedMsgs);
    this.chatService.messages.set(this.mergedMsgs);

    if(this.chatService.initThreadMsg()){
      this.chatService.initThreadMsg.set(null)
    }

    this.chatService.createMessage(this.threadId!, message)
  }

  createUnixTime(): number {
    // Get the current date and time
    const now = new Date();

    // Convert to Unix timestamp
    const unixTime = Math.floor(now.getTime() / 1000);

    return unixTime;
  }

  async getLiveMessages(threadId: string){
    this.messageLoading = true;
    this.userService.getLiveMessages(threadId).then((messages: LiveMessage[])=>{
      if(messages){
        messages = this.orderPipe.transform(messages, 'time_stamp')
        this.liveMsgs = messages
        this.chatHistory = [];
        this.liveMsgs.forEach((message: LiveMessage)=>{
          this.chatHistory?.push({role: message.role ?? 'user', content: message.message ?? ''})
        })
      }
    })
    .catch(err => {throw err})
    .finally(() => {
      this.messageLoading = false;
      this.init = false;
    });
  }

  // Refactored to return a promise
  async getMessages(threadId: string) {
    this.messagesLoading = true;
    return this.chatService
      .listMessages(threadId) // Return the promise here
      .then((messages) => {
        if (messages) {
          this.messages = messages;
          // console.log('thread window messages', messages);
        }
      })
      .catch((error) => {
        this.messages = [];
        throw error;
      })
      .finally(() => {
        this.messagesLoading = false;
      });
  }

  // Refactored to return a promise
  async getUserMessages() {
    const threadId = this.threadId;

    if (threadId) {
      this.firebaseMessagesLoading = true;
      return this.userService
        .getMessages(threadId) // Return the promise here
        .then((messages) => {
          if (messages) {
            this.userMessages = messages;
            // console.log('messages from firebase', messages);
          }
        })
        .finally(() => {
          this.firebaseMessagesLoading = false;
        });
    } else {
      return Promise.resolve(); // Return a resolved promise when there's no threadId
    }
  }

  // New method to handle both
  async loadAndMergeMessages(): Promise<boolean> {
    let loading: boolean = true;
    const threadId = this.threadId;
    if (threadId) {
     await Promise.all([this.getMessages(threadId), this.getUserMessages()])
        .then(() => {
          this.mergeMessages(); // Call mergeMessages after both promises resolve
          loading = false;
          return loading;
        })
        .catch((error) => {
          loading = false;
          return loading;
          // Handle errors from either promise
          console.error('Error loading messages', error);
        });
    }

    return loading;
  }

  createLiveThread(){
    this.userService.addLiveThread(null)
  }

  // merge messages from firebase and open ai
  mergeMessages() {
    const fireMessages = this.orderPipe.transform(this.userMessages!, 'created_at');
    // console.log('user messages', fireMessages);
    // console.log('openai messages', this.messages);

    if (!this.firebaseMessagesLoading && !this.messagesLoading) {
        if (this.mergedMsgs) {
            this.mergedMsgs.push(this.messages![this.messages!.length - 1]);
        } else {
            if (fireMessages.length > 0) {
                let mergedMessages = [...fireMessages];

                if (this.messages!.length > this.userMessages!.length) {
                    this.messages?.forEach((message) => {
                        // Check if the message is not already in the userMessages
                        const isPresent = this.userMessages?.some(userMessage => userMessage.id === message.id);
                        if (!isPresent) {
                            mergedMessages.push(message);
                        }
                    });
                } else {
                    this.mergedMsgs = mergedMessages;
                }

                this.mergedMsgs = this.orderPipe.transform(mergedMessages, 'created_at');
            }
        }
        // console.log('merged messages', this.mergedMsgs);
    }

    this.init = false;
}


  hoverUpdate(placeholder: string){
    this.placeholders = [placeholder]
    this.typed.doReset()
  }

  reset(){
    this.messages = null;
    this.liveMsgs = null;
    this.chatHistory = null
    this.userMessages = null;
    this.mergedMsgs = null;
    this.threadId = null;
    this.init = true;
    // this.$route.unsubscribe();
    this.liveChatService.disconnect();
    this.userSubscription.unsubscribe();
    // this.$messages.unsubscribe();
    this.messagesLoading = false;
    if (this.liveMesgSub) {
      this.liveMesgSub.unsubscribe();
    }
   }

  ngOnDestroy(): void {
    if(this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if(this.$route){
      this.$route.unsubscribe();
    }
  }
}
