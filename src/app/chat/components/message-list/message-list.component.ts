import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { Message } from '../../models/message.model';
import { CommonModule } from '@angular/common';
import { ScrollPanelModule } from 'primeng/scrollpanel';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { cssInfo, cssBot, cssUser } from '@ng-icons/css.gg';
import { featherThumbsUp, featherThumbsDown, featherPlayCircle } from '@ng-icons/feather-icons';

import { trigger, style, transition, animate, query, stagger, keyframes } from '@angular/animations';

import { MarkdownPipe } from '../../../shared/pipes/markdown.pipe';
import { Subscription } from 'rxjs';
import { NgxTypedJsModule } from 'ngx-typed-js';
import { MessageBubbleComponent } from "../message-bubble/message-bubble.component";
import { UserService } from '../../../core/auth/user.service';
import { NgPipesModule, OrderByPipe } from 'ngx-pipes';
import { AssistantPageComponent } from '../../../pages/assistant-page/assistant-page.component';
import { Threads } from '../../models/user_profile.model';
import { PrettyDatePipe } from '../../../shared/pipes/pretty-date.pipe';
import { LiveMessage, LiveThread } from '../../models/chat.model';
import { LiveChatService } from '../../services/live-chat.service';

@Component({
    selector: 'app-message-list',
    standalone: true,
    providers: [OrderByPipe],
    viewProviders: [provideIcons({ cssInfo, cssBot, cssUser, featherThumbsUp, featherThumbsDown, featherPlayCircle })],
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
    imports: [CommonModule, ScrollPanelModule, NgIconComponent, MarkdownPipe, NgxTypedJsModule, MessageBubbleComponent, PrettyDatePipe, NgPipesModule]
})
export class MessageListComponent implements OnInit, OnChanges {
  private userService = inject(UserService);
  private orderPipe = inject(OrderByPipe);
  private chatService = inject(LiveChatService);
  private cdr = inject(ChangeDetectorRef)

  @ViewChild('sp') messageList!: any;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  @Output() generateQuestions = new EventEmitter<boolean>();
  @Output() selectedQuestion = new EventEmitter<string>();

  @Input() messages: Message[] | null = null;
  @Input() liveMessages: LiveMessage[] | null = null;
  @Input() thread: Threads | null = null;
  @Input() liveThread: LiveThread | null = null;
  @Input() threadId: string = '';
  @Input() uid: string  = '';
  @Input() questions: string[] | null = null;


  messageLoading = this.chatService.messagesLoading;
  questionsLoading: boolean = false;
  questionsLoadingAnimated: boolean = false;

  private messagesSubscription!: Subscription;

  // messages: Message[] | null = null; // messages from open ai
  userMessages: Message[] | null = null; // messages saved to user in firebase
  orderedMsgs: LiveMessage[] | null = null; // messages saved to user in firebase

  firebaseMessagesLoading: boolean = false;

  initialLoad: boolean = true;
  constructor(public orderByPipe: OrderByPipe){

  }
  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    // Check if 'questions' exists in the changes object
    if (changes['questions'] && changes['questions'].currentValue !== undefined) {
      console.log(changes['questions'].currentValue || null);
      const questions = changes['questions'].currentValue;
      this.questionsLoadingAnimated = false;

      if (questions) {
        setTimeout(() => {
          this.questionsLoading = false;
        }, 1000);
      }
    } else {
      console.log('No changes to questions or it is undefined.');
    }
  }

  getMessageContainerHeight(): number {
    const element = this.messagesContainer.nativeElement;
    const height = element.offsetHeight; // This gives the height of the element
    // // console.log('new height', height)
    return height;
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   // when new messages come in scroll bottom
  //   // // console.log('changes', changes)
  //   if(this.messageList){
  //     this.messageList.scrollTop(this.getMessageContainerHeight());
  //   }
  // }

  toggleLoading(){
    this.questionsLoading = !this.questionsLoading;
    this.questionsLoadingAnimated = !this.questionsLoadingAnimated;
    setTimeout(() => {
      this.questionsLoadingAnimated = !this.questionsLoadingAnimated;
    }, 3000);

    setTimeout(() => {
      this.questionsLoading = !this.questionsLoading;
    }, 4000);
  }

  qsLoading(){
    if(this.questionsLoading === false){
      this.questionsLoading = true;
      this.questionsLoadingAnimated = true;
    } else if(this.questionsLoading === true){
      setTimeout(() => {
        this.questionsLoadingAnimated = false;
      }, 1000);

      setTimeout(() => {
        this.questionsLoading = false;
      }, 4000);
    }
  }

  getQuestions() {
    this.generateQuestions.emit(true)
    this.questionsLoading = true;
    this.questionsLoadingAnimated = true;
  }

  selectQuestion(question: string){
    this.questions = null;
    this.selectedQuestion.emit(question);
  }

  ngOnDestroy(): void {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
  }
}
