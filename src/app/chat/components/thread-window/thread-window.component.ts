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
  messagesLoading: boolean = true;

  placeholders: string[] = []

  showImg: boolean = false;
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
        if(this.activeLiveThread?.thread_id && this.init){
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
                this.liveMsgs![this.liveMsgs!.length - 1].id = message.id;
                this.liveMsgs![this.liveMsgs!.length - 1].model = message.model;

                this.liveMsgs![this.liveMsgs!.length - 1].animate = false; // letting animation finish


                let assistant_message = this.liveMsgs![this.liveMsgs!.length - 1]

                this.userService.addLiveMessage(assistant_message, false).then(()=>{
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
        this.createLiveMessage(initMsg);
      }
    }, 2000);
  }

  deleteThread(threadId: string) {
    this.userService.removeLiveThread(threadId)
  }

  imgLoaded(){
    this.showImg = true;
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
      uid: this.userProfile!.uid,
    }

    let messageRef = { ...message };
    messageRef.animate = true;

    if(this.liveMsgs === null) {
      this.liveMsgs = [messageRef]
      this.chatHistory = [{role: 'user', content: content}]
    } else {
      this.chatHistory?.push({role: 'user', content: content})
      this.liveMsgs.push(messageRef);
    }

    this.userService.addLiveMessage(message, true).then(()=>{ // adding message to user profile
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
        uid: this.userProfile!.uid,
        animate: true
      })
    })
  }


  async getLiveMessages(threadId: string){
    this.messagesLoading = true;
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
      this.messagesLoading = false;
      this.init = false;
    });
  }


  createLiveThread(){
    this.userService.addLiveThread(null)
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
    this.showImg = false
    // this.$route.unsubscribe();
    this.liveChatService.disconnect();
    this.userSubscription.unsubscribe();
    // this.$messages.unsubscribe();
    this.messagesLoading = true;
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
