import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { cssAirplane, cssTrashEmpty, cssCopy } from '@ng-icons/css.gg';
import { NgxTypedJsModule } from 'ngx-typed-js';
import { AssistantCardComponent } from "../assistant-card/assistant-card.component";
import { Assistant } from '../../models/assistant.model';
import { LiveChatService } from '../../services/live-chat.service';

@Component({
    selector: 'app-example-prompts',
    standalone: true,
    viewProviders: [provideIcons({ cssAirplane, cssTrashEmpty, cssCopy })],
    templateUrl: './example-prompts.component.html',
    styleUrl: './example-prompts.component.sass',
    imports: [NgIconComponent, NgxTypedJsModule, CommonModule, AssistantCardComponent]
})
export class ExamplePromptsComponent implements OnInit, OnDestroy {
  @Output() assistantOutput = new EventEmitter<Assistant>();
  liveChatService = inject(LiveChatService);
  typingAnimation = false;
  selectedAssistant: string | null = null;

  assistants: Assistant[] = [
    {
      name: 'General Student Aid',
      id: 'gen_stdnt_aid',
      img: '../assets/images/books.webp',
      title: 'General Student Aid',
      desc: 'The go-to assistant for federal student aid.'
    },
    {
      name: 'FAFSA',
      id: 'fafsa',
      img: '../assets/images/form.webp',
      title: 'FAFSA',
      desc: 'Best suited for FAFSA related questions.'
    },
    {
      name: 'College Explorer',
      id: 'college_explorer',
      img: '../assets/images/school_house.webp',
      title: 'College Explorer',
      desc: 'Explore colleges that are a best fit for you.'
    },
    {
      name: 'Loans & Forgiveness',
      id: 'loan_forg',
      img: '../assets/images/loans_2.webp',
      title: 'Loans & Forgiveness',
      desc: 'Best for loan and debt forgiveness questions.'
    },
  ];

  ngOnInit(): void {
  }
  setId(event: Assistant){
    console.log('event received', event)
    this.selectedAssistant = event.id;
    this.assistantOutput.emit(event);
    if(event.id){
      this.liveChatService.category.set(event.id);
    }
  }

  ngOnDestroy(): void {
    this.liveChatService.category.set(null)
  }

}
