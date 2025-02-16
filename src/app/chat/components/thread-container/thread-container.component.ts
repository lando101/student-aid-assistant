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
import { NgIconComponent, provideIcons } from '@ng-icons/core';
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
import { QuestionsCarouselComponent } from "../questions-carousel/questions-carousel.component";
import {  featherArrowUp, featherShare, featherSliders, featherTrash } from '@ng-icons/feather-icons';
import { MatButtonModule } from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import { EditThreadDialogComponent } from '../dialogs/edit-thread-dialog/edit-thread-dialog.component';

@Component({
    selector: 'app-thread-container',
    standalone: true,
    templateUrl: './thread-container.component.html',
    styleUrl: './thread-container.component.sass',
    providers: [OrderByPipe],
    viewProviders: [
      provideIcons({
        featherShare,
        featherTrash,
        featherSliders,
        featherArrowUp
      }),
  ],
    imports: [CommonModule, MatTooltipModule, NgIconComponent, MatButtonModule, MatIconModule, MessageListComponent, NgxTypedJsModule, LoaderComponent, ExamplePromptsComponent, PromptsCarouselComponent, NgPipesModule, QuestionsCarouselComponent]
})
export class ThreadContainerComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy{
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
  questions: string[] | null = null;

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
  $messageLoading = this.liveChatService.messagesLoading

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
        if(this.threadId !== params['threadId']){ // local thread ID does not match URL thread ID
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
          this.getLiveMessages(this.activeLiveThread.thread_id);
          console.log('getting live messages')
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


                let assistant_message = this.liveMsgs![this.liveMsgs!.length - 1];

                if(this.activeLiveThread?.thread_name === 'new thread' || this.activeLiveThread?.thread_name === null) {
                  this.liveChatService.generateTitle(assistant_message.message ?? '').then((data: any)=>{
                    if(this.activeLiveThread?.thread_id){
                      this.userService.updateLiveThread(this.activeLiveThread?.thread_id, 'thread_name', JSON.parse(data))
                    }
                  })
                }

                // let questions = this.extractQuestions(this.chatHistory[this.chatHistory.length - 1].content);
                // this.generateQuestions(this.chatHistory[this.chatHistory.length - 1].content)
                // console.log('QUESTIONS', questions)

                this.userService.addLiveMessage(assistant_message, false).then(()=>{
                  if(this.activeLiveThread?.thread_id && assistant_message.message){
                    this.userService.updateLiveThread(this.activeLiveThread?.thread_id, 'last_message', assistant_message.message)
                    .then(()=>{
                      this.userService.updateLiveThread(this.activeLiveThread!.thread_id!, 'thread_length', (this.liveMsgs ? this.liveMsgs!.length : 0))
                    })
                  }
                }).finally(()=>{
                  this.liveChatService.messagesLoading.set(false);
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
        this.initMsg.set(null)
      }
    }, 2000);
  }

  deleteThread(threadId: string) {
    this.userService.removeLiveThread(threadId)
  }

  imgLoaded(){
    this.showImg = true;
  }

//   extractQuestions(text: string): string[] {
//     const questionsStartIndex = text.indexOf("Follow-up questions:");
//     if (questionsStartIndex === -1) {
//         return [];
//     }

//     const questionsText = text.substring(questionsStartIndex);
//     const questionLines = questionsText.split('\n');

//     return questionLines
//         .slice(1) // Skip the "Follow-up questions:" line
//         .map(line => line.trim())
//         .filter(line => line.endsWith('?'));
// }

  generateQuestions() {
    const lastMessage = this.chatHistory![this.chatHistory!.length - 1].content;

    this.liveChatService.generateQuestions(lastMessage).then((questions)=>{
      console.log('questions', JSON.parse(questions))
      this.questions = JSON.parse(questions)
    })
  }

  updateSettings(thread: LiveThread | null) {
    if(thread){
      const dialogRef = this.dialog.open(EditThreadDialogComponent, {
        data: thread
      });

      dialogRef.afterClosed().subscribe((result: boolean) => {
        // // console.log('The dialog was closed');
        if (result === true) {
          this.deleteThread(thread.thread_id ?? '');
        }
      });
    }
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

  // create live message -- will update text in a live stream
  createLiveMessage(content: string){
    this.liveChatService.messagesLoading.set(true);
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
      this.liveChatService.sendMessage(this.chatHistory!, this.activeLiveThread!); // then sending message to open ai
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
    this.questions = null;
    // this.$route.unsubscribe();
    this.liveChatService.disconnect();
    this.userSubscription.unsubscribe();
    // this.$messages.unsubscribe();
    this.messagesLoading = true;
    if (this.liveMesgSub) {
      this.liveMesgSub.unsubscribe();
    }

   }

//   reset(): void {
//   this.activeLiveThread = null;
//   this.threadId = null;
//   this.liveMsgs = null;
//   this.chatHistory = null;
//   this.messages = null;
//   this.userMessages = null;
//   this.mergedMsgs = null;
//   this.init = true;
//   this.showImg = false;
//   this.questions = null;

//   if (this.liveMesgSub) {
//     this.liveMesgSub.unsubscribe();
//   }
//   if (this.$route) {
//     this.$route.unsubscribe();
//   }
//   if (this.userSubscription) {
//     this.userSubscription.unsubscribe();
//   }
//   this.liveChatService.disconnect();
// }

  ngOnDestroy(): void {
    this.reset();
    if(this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    if(this.$route){
      this.$route.unsubscribe();
    }
  }
}
