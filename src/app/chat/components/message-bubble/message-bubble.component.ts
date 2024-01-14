import { Component, Inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Message } from '../../models/message.model';
import { CommonModule } from '@angular/common';
import { NgIconComponent } from '@ng-icons/core';
import { MarkdownPipe } from "../../../shared/pipes/markdown.pipe";
import { UserService } from '../../../core/auth/user.service';

@Component({
    selector: 'app-message-bubble',
    standalone: true,
    templateUrl: './message-bubble.component.html',
    styleUrl: './message-bubble.component.sass',
    imports: [CommonModule, NgIconComponent, MarkdownPipe]
})
export class MessageBubbleComponent implements OnInit, OnChanges {
  @Input() message!: Message;

  constructor(private userService: UserService) {

  }

  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  likeMessage(liked: 1 | 2) {
    this.message.liked = liked;
    this.userService.updateMessage(this.message.thread_id!, this.message.id!, 'liked', liked)
  }
}
