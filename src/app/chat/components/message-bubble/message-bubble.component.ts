import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { Message } from '../../models/message.model';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import { MarkdownPipe } from "../../../shared/pipes/markdown.pipe";
import { UserService } from '../../../core/auth/user.service';
import { AssistantService } from '../../services/assistant.service';
import { LiveMessage } from '../../models/chat.model';

@Component({
    selector: 'app-message-bubble',
    standalone: true,
    templateUrl: './message-bubble.component.html',
    styleUrl: './message-bubble.component.sass',
    imports: [CommonModule, NgIconComponent, MarkdownPipe]
})
export class MessageBubbleComponent implements OnInit, OnChanges {
  @Input() message!: Message;
  @Input() liveMessage!: LiveMessage | null;

  chatService = inject(AssistantService)

  constructor(private userService: UserService) {

  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  likeMessage(liked: 1 | 2) {
    try {
      this.liveMessage!.liked = liked;
      this.userService.updateLiveMessage(this.liveMessage!.thread_id!, this.liveMessage!.id!, 'liked', liked)
    } catch (error) {
      throw error
    }
  }
}
