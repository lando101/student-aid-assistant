import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, inject } from '@angular/core';
import { Message } from '../../models/message.model';
import { CommonModule } from '@angular/common';
import { ScrollPanelModule } from 'primeng/scrollpanel';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { cssInfo, cssBot, cssUser } from '@ng-icons/css.gg';
import { featherThumbsUp, featherThumbsDown } from '@ng-icons/feather-icons';

import { trigger, style, transition, animate, query, stagger, keyframes } from '@angular/animations';

import { ChatService } from '../../services/chat.service';
import { MarkdownPipe } from '../../../shared/pipes/markdown.pipe';
import { Subscription } from 'rxjs';
import { NgxTypedJsModule } from 'ngx-typed-js';
import { MessageBubbleComponent } from "../message-bubble/message-bubble.component";
import { UserService } from '../../../core/auth/user.service';
import { OrderByPipe } from 'ngx-pipes';
@Component({
    selector: 'app-message-list',
    standalone: true,
    providers: [OrderByPipe],
    viewProviders: [provideIcons({ cssInfo, cssBot, cssUser, featherThumbsUp, featherThumbsDown })],
    animations: [
        trigger('listAnimation', [
            transition('* => *', [
                query(':enter', [
                    style({ opacity: 0, transform: 'translateY(100%)' }),
                    stagger('100ms', animate('300ms ease-out', keyframes([
                        style({ opacity: 0, transform: 'translateY(10px)', offset: 0 }),
                        style({ opacity: 1, transform: 'translateY(-7px)', offset: 0.7 }),
                        style({ opacity: 1, transform: 'translateY(0)', offset: 1 }) // Settle back to 100%
                    ])))
                ], { optional: true })
            ])
        ]),
        trigger('fadeInOut', [
            // Fade in up (equivalent to 'enter')
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(10px)' }),
                animate('300ms 550ms', keyframes([
                    style({ opacity: 0, transform: 'translateY(10px)', offset: 0 }),
                    style({ opacity: 1, transform: 'translateY(-7px)', offset: 0.7 }),
                    style({ opacity: 1, transform: 'translateY(0)', offset: 1 }) // Settle back to 100%
                ])),
            ]),
            // Fade out down (equivalent to 'leave')
            transition(':leave', [
                animate('100ms ease-out', style({ opacity: 0, transform: 'translateY(100%)' }))
            ])
        ])
    ],
    // changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './message-list.component.html',
    styleUrl: './message-list.component.sass',
    imports: [CommonModule, ScrollPanelModule, NgIconComponent, MarkdownPipe, NgxTypedJsModule, MessageBubbleComponent]
})
export class MessageListComponent implements OnInit, OnChanges {
  @ViewChild('sp') messageList!: any;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  @Input() messageLoading: boolean = false;
  @Input() threadId: string = '';
  @Input() uid: string  = '';

  private userService = inject(UserService);
  private orderPipe = inject(OrderByPipe)

  private messagesSubscription!: Subscription;

  messages: Message[] | null = null; // messages from open ai
  userMessages: Message[] | null = null; // messages saved to user in firebase
  mergedMsgs: Message[] | null = null; // messages saved to user in firebase

  firebaseMessagesLoading: boolean = false;

  initialLoad: boolean = true;
  constructor(private chatService: ChatService){

  }
  ngOnInit(): void {
    this.messagesSubscription = this.chatService.$messages.subscribe(
      (messages: Message[]) => {
        if (messages) {
          this.messages = messages;
          this.mergeMessages()
        }
        setTimeout(() => {
          this.initialLoad = false;
        }, 50);

        // console.log('messages list', this.messages);
      },
      error => {
        // handle error
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes', changes)
    let threadId = changes['threadId']?.currentValue;
    if(threadId) {
      // alert('new thread' + threadId)
      this.firebaseMessagesLoading = true;
      this.userService.getMessages(threadId).then((messages)=>{
        if(messages) {
          this.userMessages = [];
          messages.forEach((message)=>{
            this.userMessages?.push(message)
          })
          console.log('messages from firebase', messages)
          // this.userMessages = messages;
          this.firebaseMessagesLoading = false;
          this.mergeMessages()
        }
      })
    }
  }

  // merge messages from firebase and open ai
  mergeMessages(){
    const fireMessages:Message[] = this.orderPipe.transform(this.userMessages!, 'created_at');
    const aiMessages:Message[] = this.orderPipe.transform(this.messages!, 'created_at');

    if(!this.firebaseMessagesLoading && !this.messageLoading) {
      if(this.mergedMsgs){
        this.mergedMsgs?.push(this.messages![this.messages!.length-1])
      } else {
        this.mergedMsgs = fireMessages; // if init fire messages become visible messages
      }
      // console.log('fire', fireMessages)
      // console.log('ai', aiMessages)
    }
  }

  getMessageContainerHeight(): number {
    const element = this.messagesContainer.nativeElement;
    const height = element.offsetHeight; // This gives the height of the element
    // console.log('new height', height)
    return height;
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   // when new messages come in scroll bottom
  //   // console.log('changes', changes)
  //   if(this.messageList){
  //     this.messageList.scrollTop(this.getMessageContainerHeight());
  //   }
  // }

  ngOnDestroy(): void {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
  }
}
