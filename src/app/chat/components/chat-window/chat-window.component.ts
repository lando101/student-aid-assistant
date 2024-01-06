// Angular Core Modules
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

// RxJS Imports
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';

// Angular Material Modules
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';

// PrimeNG Modules
import { MenuItem } from 'primeng/api';


// Third-Party Libraries
import moment from 'moment';

// Local Services
import { ChatService } from '../../services/chat.service';
import { StorageService } from '../../services/storage.service';
import { UserService } from '../../../core/auth/user.service';

// Local Models
import { Thread } from '../../models/thread.model';
import { Message } from '../../models/message.model';
import { Threads, UserProfile } from '../../models/user_profile.model';

// Local Components
import { MessageListComponent } from '../message-list/message-list.component';
import { ExamplePromptsComponent } from '../example-prompts/example-prompts.component';
import { PromptsCarouselComponent } from '../prompts-carousel/prompts-carousel.component';

// Icons from @ng-icons
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
    cssAirplane, cssTrashEmpty, cssCopy, cssPathTrim, cssCoffee,
    cssAdd, cssMenu, cssMoreVertical, cssPen, cssPlayButtonO
} from '@ng-icons/css.gg';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DeleteDialogComponent } from '../dialogs/delete-dialog/delete-dialog.component';
import { animate, keyframes, query, stagger, style, transition, trigger } from '@angular/animations';
import { NgxTypedJsModule } from 'ngx-typed-js';
import { RenameDialogComponent } from '../dialogs/rename-dialog/rename-dialog.component';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MessageListComponent,
    NgIconComponent,
    ExamplePromptsComponent,
    PromptsCarouselComponent,
    MatSidenavModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    NgxTypedJsModule,
    RenameDialogComponent
  ],
  providers: [HttpClientModule],
  animations: [
    trigger('listAnimationTest', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(100%)' }),
            stagger(
              '100ms',
              animate(
                '800ms ease-out',
                keyframes([
                  style({
                    opacity: 0,
                    transform: 'translateY(10px)',
                    offset: 0,
                  }),
                  style({
                    opacity: 1,
                    transform: 'translateY(-7px)',
                    offset: 0.7,
                  }), // Overshoot to 105%
                  style({ opacity: 1, transform: 'translateY(0)', offset: 1 }), // Settle back to 100%
                ])
              )
            ),
          ],
          { optional: true }
        ),
      ]),
    ]),
  ],
  viewProviders: [
    provideIcons({
      cssAirplane,
      cssTrashEmpty,
      cssCopy,
      cssPathTrim,
      cssCoffee,
      cssAdd,
      cssMenu,
      cssMoreVertical,
      cssPen,
      cssPlayButtonO,
    }),
  ],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.sass',
})
export class ChatWindowComponent implements OnInit {
  @ViewChild('chatbox') chatbox: ElementRef | null = null;

  thread$?: Observable<Thread>;
  private destroy$ = new Subject<void>();

  threadId: string = '';
  messages: Message[] = [];
  thread!: Thread;

  messageLoading: boolean = false;
  threadLoading: boolean = false;

  userProfile!: UserProfile;

  showFiller = false;
  items: MenuItem[] | undefined;

  constructor(
    private chatService: ChatService,
    private storageService: StorageService,
    private userService: UserService,
    public dialog: MatDialog
  ) {}
  ngOnInit(): void {
    this.createThread();

    this.chatService.$messageLoading.subscribe((loading) => {
      this.messageLoading = loading;
      // alert('message loading'+loading)
      // console.log('message loading:', loading)
    });

    this.chatService.$threadLoading.subscribe((loading) => {
      this.threadLoading = loading;
    });

    this.userService.$userProfile.subscribe((userProfile) => {
      if (userProfile) {
        this.userProfile = userProfile;
      }
    });
  }

  // create thread
  createThread() {
    this.chatService
      .createThread()
      .then((thread) => {
        // // console.log('thread id from chat window', thread.id)
        this.threadId = thread.id || '';
        this.thread = thread;
        if (thread.id) {
          this.chatService
            .listMessages()
            .pipe(takeUntil(this.destroy$))
            .subscribe((messages) => {
              // console.log('messages', messages);
              messages = messages.sort((a, b) => a.created_at! - b.created_at!);
              this.messages = messages ? messages : [];
              this.chatService._messages.next(this.messages);
            });
        }
      })
      .catch((error) => {
        console.error('Error fetching thread:', error);
      });
  }

  createNewThread() {
    this.chatService
      .createNewThread()
      .then((thread) => {
        this.threadId = thread.id || '';
        this.thread = thread;
        // console.log(thread)
        if (thread.id) {
          this.chatService
            .listMessages()
            .pipe(takeUntil(this.destroy$))
            .subscribe((messages) => {
              // console.log('messages', messages);
              messages = messages.sort((a, b) => a.created_at! - b.created_at!);
              this.messages = messages ? messages : [];
              this.chatService._messages.next(this.messages);
            });
        }
      })
      .catch((error) => {
        console.error('Error fetching thread:', error);
      });
  }

  getThread(threadId: string) {
    if (threadId) {
      this.chatService.getThread(threadId).then((thread) => {
        this.threadId = thread.id || '';
        this.thread = thread;
        if (thread.id) {
          this.chatService
            .listMessages()
            .pipe(takeUntil(this.destroy$))
            .subscribe((messages) => {
              // console.log('messages', messages);
              messages = messages.sort((a, b) => a.created_at! - b.created_at!);
              this.messages = messages ? messages : [];
              this.chatService._messages.next(this.messages);
            });
        }
      });
    } else {
      // console.log('No thread ID')
    }
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
      thread_id: this.threadId,
    };
    if (this.chatbox) {
      this.chatbox.nativeElement.value = '';
    }

    this.messages.push(userMessage);
    this.chatService._messages.next(this.messages);

    this.chatService.createMessage(message).subscribe(
      (response) => {
        // console.log('Message sent response', response);
        this.runAssistant(
          'you are a assistant that is an expert with student aid in the united states. only answer questions related to student aid. '
        ); // update this to say "address user as first name last name"
      },
      (error) => {
        alert('Error creating message');
      }
    );
    // .subscribe({
    //   next(data) {
    //     // console.log('Message sent response', data);
    //     this.runAssistant()
    //   },
    //   error(err) {
    //     alert('Error creating message');
    //   }
    // })
  }

  // run assistant
  runAssistant(instructions?: string) {
    this.chatService.runAssistant(instructions).subscribe(
      (response) => {
        // console.log('Assistant run response:', response);
        if (response.id) {
          this.checkRunStatus(response.id);
        } else {
          alert('no id');
        }
      },
      (error) => {
        alert('Error running assistant');
      }
    );
  }

  // check status :: for 10 seconds check for status STOP if status is completed :: then get messages list
  checkRunStatus(runId: string) {
    const duration = 10 * 1000; // 10 seconds
    const startTime = Date.now();

    this.chatService.pollStatus(runId).subscribe(
      (response) => {
        // console.log('Status:', response.status);
        if (response.status === 'completed') {
          // get message list if completed
          // console.log('Status: (done)', response.status);
          this.chatService.listMessages().subscribe(
            (response) => {
              // console.log('Messages:', response)
              this.updateMessages(response);
            },
            (error) => {
              alert('Error getting messages');
            }
          );
        }
      },
      (error) => {
        alert('Error getting run status');
      }
    );
  }

  // update message list
  updateMessages(newMessages: Message[]): void {
    if (this.messages.length === 0) {
      this.messages = newMessages;
      this.chatService._messages.next(this.messages);
    } else {
      // Assuming newMessages are sorted with the newest first
      this.messages[this.messages.length - 1].id = newMessages[1].id; // replacing locally created message with open ai message
      this.messages.push(newMessages[0]);
      this.chatService._messages.next(this.messages);
    }
    // console.log('messages list:', this.messages)
  }

  deleteThread(threadId: string) {
    this.chatService.deleteThread(threadId).then(
      (respsone) => {
        this.storageService.removeItem('thread'); // removing thread from local storage
        this.messages = [];
        if (this.userProfile.threads) {
          if (this.userProfile.threads.length > 1) {
            this.getThread(
              this.userProfile.threads![
                this.userProfile.threads.length - 1 ?? 0
              ].thread_id ?? ''
            );
          } else {
            this.createThread();
          }
        } else {
          this.createThread();
        }

        this.chatService._messages.next(this.messages);
      },
      (error) => {
        alert('Error deleting thread');
      }
    );
  }

  openDialog(thread: Threads | null): void {
    if (thread) {
      const dialogRef = this.dialog.open(DeleteDialogComponent, {
        data: {
          thread_name: thread.thread_name,
          thread_id: thread.thread_id,
          creation_date: thread.creation_date,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        // console.log('The dialog was closed');
        if (result === true) {
          this.deleteThread(thread.thread_id ?? '');
        }
      });
    } else {
      alert('error deleting thread');
    }
  }

  renameDialog(thread: Threads | null): void {
    if (thread) {
      const dialogRef = this.dialog.open(RenameDialogComponent, {
        data: {
          thread_name: thread.thread_name,
          thread_id: thread.thread_id,
          creation_date: thread.creation_date,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        // console.log('The dialog was closed');
        if (result === true) {
          this.userService.updateThread(null, null);
        }
      });
    } else {
      alert('error deleting thread');
    }
  }

  createUnixTime(): number {
    // Get the current date and time
    const now = new Date();

    // Convert to Unix timestamp
    const unixTime = Math.floor(now.getTime() / 1000);

    return unixTime;
  }

  dateConversion(date: any): string {
    const formatted_date = moment(date, 'HH:mm:ss [GMT]Z (z)');
    // return `${formatted_date.fromNow()} (${formatted_date.format('lll')})`
    return `${formatted_date.format('lll')}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
