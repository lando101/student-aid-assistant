import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Signal, ViewChild, computed, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { UserService } from '../../core/auth/user.service';
import { AssistantService } from '../../chat/services/assistant.service';
import { Threads, UserProfile } from '../../chat/models/user_profile.model';
import { Subscription, debounceTime, filter, fromEvent, map } from 'rxjs';

// material imports
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { NgPipesModule, OrderByPipe } from 'ngx-pipes';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// ng icons
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { cssAirplane, cssTrashEmpty, cssCopy, cssPathTrim, cssCoffee, cssAdd, cssMenu, cssMoreVertical, cssPen, cssPlayButtonO } from '@ng-icons/css.gg';
import { featherClock, featherEdit, featherTrash, featherPlusSquare, featherSend } from '@ng-icons/feather-icons';
import { iconoirTrash } from '@ng-icons/iconoir';
import { CommonModule } from '@angular/common';
import { TimeagoPipe } from '../../shared/pipes/timeago.pipe';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { animate, keyframes, query, stagger, state, style, transition, trigger } from '@angular/animations';
import { NgxTypedJsModule } from 'ngx-typed-js';
import { Message } from '../../chat/models/message.model';
import { DeleteDialogComponent } from '../../chat/components/dialogs/delete-dialog/delete-dialog.component';
import { Thread } from '../../chat/models/thread.model';

@Component({
  selector: 'app-assistant',
  standalone: true,
  providers: [HttpClientModule, OrderByPipe],
  animations: [
    trigger('listAnimationTest', [
        transition('* => *', [
            query(':enter', [
                style({ opacity: 0, transform: 'translateY(100%)' }),
                stagger('100ms', animate('800ms ease-out', keyframes([
                    style({
                        opacity: 0,
                        transform: 'translateY(10px)',
                        offset: 0,
                    }),
                    style({
                        opacity: 1,
                        transform: 'translateY(-7px)',
                        offset: 0.7,
                    }),
                    style({ opacity: 1, transform: 'translateY(0)', offset: 1 }), // Settle back to 100%
                ]))),
            ], { optional: true }),
        ]),
    ]),
    trigger('growShrink', [
        state('void', style({ height: '0', scale: .93, opacity: 0, margin: '0' })),
        state('*', style({ height: '90px', scale: 1, opacity: 1, margin: '8px' })),
        transition('void => *', [
            animate('280ms ease-in', keyframes([
                style({ height: '0', scale: .93, opacity: 0, offset: 0, margin: '0' }),
                style({ height: '90px', scale: .93, opacity: 0, offset: 0.55 }),
                style({ height: '90px', scale: .93, opacity: 1, offset: 0.65 }),
                style({ height: '90px', scale: 1, opacity: 1, offset: 1, margin: '8px' }), // Then shrink to final size
            ]))
        ]),
        transition('* => void', [
            animate('350ms ease-out', keyframes([
                style({ height: '90px', scale: 1, opacity: 1, offset: 0, margin: '8px' }),
                style({ height: '90px', scale: .93, opacity: 1, offset: 0.35 }),
                style({ height: '90px', scale: .93, opacity: 1, offset: 0.6 }),
                style({ height: '0', scale: .93, opacity: 0, offset: 1, margin: '0' }), // Fully disappear
            ]))
        ])
    ]),
    trigger('fadeInOut', [
        state('void', style({ opacity: 0 })),
        state('*', style({ opacity: 1 })),
        transition(':enter', [animate('0.5s 500ms ease-out', keyframes([
                style({ opacity: 0, offset: 0, scale: .95 }),
                style({ opacity: .5, transform: 'translateY(-10px)', offset: .5, scale: .95 }),
                style({ opacity: 1, transform: 'translateY(0px)', offset: 1, scale: 1 })
            ]))]),
        transition(':leave', [animate('0.5s ease-in', keyframes([
                style({ opacity: 1, offset: 0, scale: 1 }),
                style({ opacity: 0, offset: 1, scale: .95 })
            ]))]) // 100% to 0% opacity
    ])
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
        featherClock,
        featherEdit,
        featherTrash,
        featherPlusSquare,
        featherSend,
        iconoirTrash
    }),
],
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatSidenavModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDialogModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    NgIconComponent,
    TimeagoPipe,
    SelectButtonModule,
    FormsModule,
    NgPipesModule,
    NgxTypedJsModule
  ],
  templateUrl: './assistant.component.html',
  styleUrl: './assistant.component.sass'
})
export class AssistantComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('drawer') drawer!: MatDrawer;

  chatService = inject(AssistantService);
  userService = inject(UserService);
  router = inject(ActivatedRoute);
  dialog = inject(MatDialog);
  resizeSubscription: Subscription = new Subscription();

  threads: Threads[] = [];
  threadsLoading: boolean = true;
  userProfile!: UserProfile;
  activeThreadId: string | null = null;

  width!: string;
  widthValue: number = 0;
  body!: HTMLElement;

  stateOptions: any[] = [{label: 'Recent', value: 'last_updated'}, {label: 'Oldest', value: '-last_updated'}];
  value: string = 'last_updated';

  messageLoading: Signal<boolean> = computed(()=>this.chatService.messageLoading());

  constructor(private nav: Router){

  }

  ngOnInit(): void {
    this.userService.$userProfile.subscribe((userProfile) => {
      if (userProfile) {
        this.userProfile = userProfile;
        // this.threads = userProfile.threads
        this.threadsLoading = true;
        this.updateThreads(this.threads, userProfile.threads)

        const threads = userProfile.threads;
        let activeThread: Threads | null = this.chatService.activeThread()
        let activeThreadPresent: any;
        if(activeThread){
          activeThreadPresent = threads.find((thread: Threads) => { return thread.thread_id === activeThread?.thread_id; });
          if(!activeThreadPresent){
            this.nav.navigateByUrl('/assistant')
          }
        }
      }
    });
    this.router.params.subscribe(params => {
      const threadId = params['threadId'];
    });


    this.nav.events
  .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
  .subscribe((ev: NavigationEnd) => {
    let url = ev.url;
    console.log('active thread id', url)
  });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.body = document.body;
      this.width = `${this.body.clientWidth}px`;
      this.widthValue = this.body.clientWidth;
        console.log('body width', this.width);
        this.setupResizeListener();
      }, 500);
  }

  deleteThread(threadId: string) {
    this.chatService.deleteThread(threadId).then(
      (respsone) => {
        if (this.userProfile?.threads) {
          if (this.userProfile.threads.length > 1) {
            // route to the next thread
          }
        }
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

      dialogRef.afterClosed().subscribe((result: boolean) => {
        // console.log('The dialog was closed');
        if (result === true) {
          this.deleteThread(thread.thread_id ?? '');
        }
      });
    } else {
      alert('error deleting thread');
    }
  }

  private setupResizeListener() {
    const element = this.body;

    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(300)) // Adjust debounceTime as needed to reduce unnecessary updates
      .subscribe(() => {
        const width = element.offsetWidth;
        this.widthValue = width;
        this.width = `${width}px`
        // Handle the width change here or emit it to an observable/subject
        console.log('body width changed', width);
      });
  }

  // this is how the threads animate properly :: add and remove thread from array based on updates
  updateThreads(oldArray: Threads[], newArray: Threads[]) {
    // Creating a map of thread IDs for easy lookup
    if (oldArray.length !== newArray.length) {
      const oldThreadMap = new Map(
        oldArray.map((thread) => [thread.thread_id, thread])
      );

      // Add new threads to the old array
      newArray.forEach((thread) => {
        if (!oldThreadMap.has(thread.thread_id)) {
          oldArray.push(thread);
        }
      });

      // Filter out deleted threads from the old array
      this.threads = oldArray.filter((thread) =>
        newArray.some((newThread) => newThread.thread_id === thread.thread_id)
      );
    } else if (oldArray.length === newArray.length) {
      newArray.forEach((arrayItem) => {
        const index = this.threads.findIndex(
          (thread) => thread.thread_id === arrayItem.thread_id
        );
        // console.log('new content', this.threads[index].last_message_content)

        if (index >= 0) {
          console.log('new content', this.threads[index].last_message_content);
          this.threads[index].last_message_content =
            arrayItem.last_message_content;
          this.threads[index].last_updated = arrayItem.last_updated;
          this.threads[index].thread_name = arrayItem.thread_name;
        }
        //  console.log('match index', index)
      });
    }
    this.threadsLoading = false;
  }

  createNewThread(){
    this.chatService.createThread().then((thread: Thread)=>{
      if(thread) {
        this.nav.navigateByUrl(`assistant/${thread.id}`);
      }
      console.log('new thread', thread)
    })
  }

  setActiveThread(thread: Threads){
    this.chatService.activeThread.set(thread ?? null)
  }

  ngOnDestroy(): void {

  }
}
