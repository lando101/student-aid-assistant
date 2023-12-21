import { Component, Input } from '@angular/core';
import { Message } from '../../models/message.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.sass'
})
export class MessageListComponent {
  @Input() messages: Message[] = [];

}
