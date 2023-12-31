import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { Message } from '../../models/message.model';
import { CommonModule } from '@angular/common';
import { ScrollPanelModule } from 'primeng/scrollpanel';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { cssInfo, cssBot, cssUser } from '@ng-icons/css.gg';

import * as moment from 'moment';
import { ChatService } from '../../services/chat.service';
@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule, ScrollPanelModule, NgIconComponent],
  viewProviders: [provideIcons({ cssInfo, cssBot, cssUser })],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.sass'
})
export class MessageListComponent implements OnInit {
  @ViewChild('sp') messageList!: any;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  @Input() messageLoading: boolean = false;

  messages: Message[] = [];
  constructor(private chatService: ChatService){

  }
  ngOnInit(): void {
    this.chatService.$messages.subscribe((messages: Message[]) =>{
      if (messages.length > 0) {
        this.messages = messages;
        console.log('message list component', this.messages)
        setTimeout(() => {
          // this.messageList.scrollTop(this.getMessageContainerHeight());
        }, 2000);
      }
    },
    error =>{

    })
  }

  getMessageContainerHeight(): number {
    const element = this.messagesContainer.nativeElement;
    const height = element.offsetHeight; // This gives the height of the element
    console.log('new height', height)
    return height;
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   // when new messages come in scroll bottom
  //   console.log('changes', changes)
  //   if(this.messageList){
  //     this.messageList.scrollTop(this.getMessageContainerHeight());
  //   }
  // }
}
