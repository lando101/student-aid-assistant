// Angular Core Modules
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

// RxJS Imports
import { BehaviorSubject, Observable, Subject, Subscription, debounceTime, fromEvent, map, takeUntil } from 'rxjs';

// Angular Material Modules
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

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
import { NgIconComponent, provideIcons, provideNgGlyphs } from '@ng-icons/core';
import {
    cssAirplane, cssTrashEmpty, cssCopy, cssPathTrim, cssCoffee,
    cssAdd, cssMenu, cssMoreVertical, cssPen, cssPlayButtonO
} from '@ng-icons/css.gg';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DeleteDialogComponent } from '../dialogs/delete-dialog/delete-dialog.component';
import { animate, keyframes, query, stagger, state, style, transition, trigger } from '@angular/animations';
import { NgxTypedJsComponent, NgxTypedJsModule } from 'ngx-typed-js';
import { RenameDialogComponent } from '../dialogs/rename-dialog/rename-dialog.component';
import { TimeagoPipe } from "../../../shared/pipes/timeago.pipe";
import { featherClock, featherEdit, featherTrash, featherPlusSquare, featherSend } from '@ng-icons/feather-icons';
import { iconoirTrash } from '@ng-icons/iconoir'
import { SelectButtonModule } from 'primeng/selectbutton';
import { BadgeModule } from 'primeng/badge';
import {NgPipesModule, OrderByPipe} from 'ngx-pipes';
import { threadId } from 'worker_threads';
import { RouterLink, RouterModule, RouterOutlet } from '@angular/router';
import { AssistantService } from '../../services/assistant.service';
import { Router } from 'express';

@Component({
  selector: 'app-thread-window',
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
    RenameDialogComponent,
    TimeagoPipe,
    SelectButtonModule,
    BadgeModule,
    NgPipesModule,
    RouterModule
  ],
  templateUrl: './thread-window.component.html',
  styleUrl: './thread-window.component.sass',
})
export class ThreadWindowComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chatbox') chatbox: ElementRef | null = null;
  @ViewChild('drawer') drawer!: MatDrawer;

  activeThreadId: string = '';

  chatService = inject(AssistantService);
  userService = inject(UserService);


  threads: Threads[] = [];
  userProfile!: UserProfile;

  width!: string;
  widthValue: number = 0;
  body!: HTMLElement;
  private resizeSubscription!: Subscription;

  stateOptions: any[] = [{label: 'Recent', value: '-last_updated'}, {label: 'Oldest', value: 'last_updated'}];
  value: string = '-last_updated';

  constructor(public router: Router){

  }

  ngOnInit(): void {
    this.userService.$userProfile.pipe(
      map((user: UserProfile) => {
        this.userProfile = user;
        this.updateThreads(this.threads, user.threads!);
      })
    );
  }

  ngAfterViewInit(): void {

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
  }

  createNewThread(){
    this.chatService.createThread()
  }

  ngOnDestroy(): void {

  }
}
