import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { LoaderComponent } from "../../../shared/components/loader/loader.component";
import { ExamplePromptsComponent } from "../example-prompts/example-prompts.component";
import { AssistantService } from '../../services/assistant.service';
import { PromptsCarouselComponent } from "../prompts-carousel/prompts-carousel.component";
import { NgxTypedJsComponent, NgxTypedJsModule } from 'ngx-typed-js';
import { NgIconComponent } from '@ng-icons/core';
import { Thread } from '../../models/thread.model';
import { Router } from '@angular/router';
import { Assistant } from '../../models/assistant.model';
import { LiveChatService } from '../../services/live-chat.service';
import { UserService } from '../../../core/auth/user.service';

@Component({
    selector: 'app-no-thread',
    standalone: true,
    templateUrl: './no-thread.component.html',
    styleUrl: './no-thread.component.sass',
    imports: [LoaderComponent, ExamplePromptsComponent, PromptsCarouselComponent, NgxTypedJsModule, NgIconComponent]
})
export class NoThreadComponent implements OnInit {
  chatService = inject(AssistantService)
  userService = inject(UserService)
  placeholders: string[] = []
  assistant: Assistant | null = null;
  @ViewChild('typed') typed!: NgxTypedJsComponent;
  @ViewChild('inputbox') inputBox!: ElementRef;

  constructor(private nav: Router){

  }

  ngOnInit(): void {
    this.chatService.activeThread.set(null)
  }

  hoverUpdate(placeholder: string){
    const inputValue = this.inputBox.nativeElement.value;
    if(!inputValue){
      this.placeholders = [placeholder]
      this.typed.doReset()
    }
  }

  createNewThread(message: string){
    if(message){
      this.chatService.createThread().then((thread: Thread)=>{
        if(thread) {
          // this.nav.navigateByUrl(`assistant/${thread.id}`);
          const url = `assistant/${thread.id}`;
          this.chatService.initThreadMsg.set(message)
          this.nav.navigateByUrl(url);
        }
      })
    }
  }

  createLiveThread(message: string) {
    if(message) {
      this.userService.addLiveThread(null, this.assistant?.id ?? 'gen_stdnt_aid').then((threadId: string)=>{
        setTimeout(() => {
          const url = `assistant/${threadId}`;
          this.chatService.initThreadMsg.set(message)
          this.nav.navigateByUrl(url);
        }, 150);
      })
    }
  }
}
