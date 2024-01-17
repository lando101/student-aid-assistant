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
import { OrderByPipe } from 'ngx-pipes';
import { NgxTypedJsModule } from 'ngx-typed-js';
import { LoaderComponent } from "../../../shared/components/loader/loader.component";

@Component({
    selector: 'app-thread-window',
    standalone: true,
    templateUrl: './thread-window.component.html',
    styleUrl: './thread-window.component.sass',
    imports: [CommonModule, NgIconComponent, MatIconModule, MessageListComponent, NgxTypedJsModule, LoaderComponent]
})
export class ThreadWindowComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy{
  @ViewChild('chatbox') chatbox: ElementRef | null = null;


  chatService = inject(AssistantService);
  userService = inject(UserService);
  orderPipe = inject(OrderByPipe);
  messageLoading = this.chatService.messageLoading();
  activeThread: Threads | null = null

  userProfile: UserProfile | null = null;
  userSubscription!: Subscription;

  threadId: string | null = null;
  $route!: Subscription;

  messages: Message[] | null = null; // messages from open ai
  userMessages: Message[] | null = null; // messages saved to user in firebase
  mergedMsgs: Message[] | null = null; // messages saved to user in firebase
  firebaseMessagesLoading: boolean = false;
  $messages!: Subscription;
  messagesLoading: boolean = false;

  placeholders: string[] = []

  init = true;

  constructor(private route: ActivatedRoute) {
    effect(()=>{
      if(this.init === false){
        console.log('signal messages', this.chatService.messages())
      }
    });
  }

  ngOnInit(): void {


    this.$messages
    // this.userSubscription = this.userService.$userProfile.subscribe((user) => {
    //   this.userProfile = user;
    //   this.$route = this.route.params.subscribe((params) => {
    //     if(params['threadId'] !== this.threadId){
    //       this.reset()
    //     }
    //     console.log('params', params);
    //     this.threadId = params['threadId'];
    //     if (this.threadId && this.userProfile) {
    //       this.loadAndMergeMessages();
    //     }
    //   });
    //   // this.loadAndMergeMessages();
    // });


    this.$route = this.route.params.subscribe((params)=>{
      if(this.threadId) {
        if(this.threadId !== params['threadId']){
          this.reset();
          this.threadId = params['threadId'];
        }
      } else {
        this.threadId = params['threadId'];
      }
      this.userSubscription = this.userService.$userProfile.subscribe((user)=>{
        this.userProfile = user;
        this.activeThread = this.userProfile?.threads?.find((thread)=>thread.thread_id === this.threadId) ?? null
      })
      if(this.threadId && this.userProfile){
        this.loadAndMergeMessages()
        this.$messages = this.chatService.$messages.subscribe((messages: Message[])=>{
          if(this.init === false){
            console.log('new messages', messages)
            if(messages.length>0){
              this.mergedMsgs?.push(messages[0]);
              // this.userService.addMessages(messages[0].thread_id ?? '', messages[0])
              this.userService.updateThread(messages[0].thread_id!, 'last_message_content', messages[0].content[0].text.value)
              this.userService.addMessages(messages[0].thread_id!, messages[0]).then(()=>{ // adding messages to user in firestore
                this.userService.addMessages(messages[1].thread_id!, messages[1]);
              });
            }
          }

          // if(!this.init){
          //   if(this.mergedMsgs?.length ?? 0 > 0){
          //     // this.updateMessages(messages)
          //   }
          // }
        })
      }
    })
  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  ngAfterViewInit(): void {
    // this.messages = this.chatService.messages()
  }

  // updateMessages(newMessages: Message[]): void {
  //   console.log('new messages', newMessages)
  //   // Assuming newMessages are sorted with the newest first
  //   if(this.mergedMsgs){
  //     this.mergedMsgs[this.mergedMsgs.length - 1].id = newMessages[1].id; // replacing locally created message with open ai message
  //     this.mergedMsgs.push(newMessages[0]);
  //     try {
  //       this.userService.updateThread(newMessages[0].thread_id!, 'last_message_content', newMessages[0].content[0].text.value)
  //       this.userService.addMessages(newMessages[0].thread_id!, newMessages[0]).then(()=>{ // adding messages to user in firestore
  //         this.userService.addMessages(newMessages[1].thread_id!, newMessages[1]);
  //       });
  //     } catch (error) {

  //     }
  //   }

  // }


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
    this.chatService.messages.set(this.mergedMsgs)

    this.chatService.createMessage(this.threadId!, message)
  }

  createUnixTime(): number {
    // Get the current date and time
    const now = new Date();

    // Convert to Unix timestamp
    const unixTime = Math.floor(now.getTime() / 1000);

    return unixTime;
  }

  // Refactored to return a promise
  async getMessages(threadId: string) {
    this.messagesLoading = true;
    return this.chatService
      .listMessages(threadId) // Return the promise here
      .then((messages) => {
        if (messages) {
          this.messages = messages;
          console.log('thread window messages', messages);
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
      console;
      this.firebaseMessagesLoading = true;
      return this.userService
        .getMessages(threadId) // Return the promise here
        .then((messages) => {
          if (messages) {
            this.userMessages = messages;
            console.log('messages from firebase', messages);
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
  loadAndMergeMessages() {
    const threadId = this.threadId;
    if (threadId) {
      Promise.all([this.getMessages(threadId), this.getUserMessages()])
        .then(() => {
          this.mergeMessages(); // Call mergeMessages after both promises resolve
        })
        .catch((error) => {
          // Handle errors from either promise
          console.error('Error loading messages', error);
        });
    }
  }

  // merge messages from firebase and open ai
  mergeMessages() {
    const fireMessages = this.orderPipe.transform(this.userMessages!, 'created_at');
    console.log('user messages', fireMessages);
    console.log('openai messages', this.messages);

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
        console.log('merged messages', this.mergedMsgs);
    }

    this.init = false;
}

  // updateMessages(newMessages: Message[]): void {
  //   if (this.messages.length === 0) {
  //     this.messages = newMessages;
  //     this.chatService._messages.next(this.messages);
  //   } else {
  //     // Assuming newMessages are sorted with the newest first
  //     this.messages[this.messages.length - 1].id = newMessages[1].id; // replacing locally created message with open ai message
  //     this.messages.push(newMessages[0]);
  //     try {
  //       this.userService.updateThread(newMessages[0].thread_id!, 'last_message_content', newMessages[0].content[0].text.value)
  //       this.userService.addMessages(newMessages[0].thread_id!, newMessages[0]).then(()=>{ // adding messages to user in firestore
  //         this.userService.addMessages(newMessages[1].thread_id!, newMessages[1]);
  //       });
  //     } catch (error) {

  //     }

  //     this.chatService._messages.next(this.messages);
  //   }
  //   // console.log('messages list:', this.messages)
  // }

  reset(){
    this.messages = null;
    this.userMessages = null;
    this.mergedMsgs = null;
    this.threadId = null;
    this.init = true;
    // this.$route.unsubscribe();
    // this.userSubscription.unsubscribe();
    this.firebaseMessagesLoading = false;
    this.messagesLoading = false;
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
