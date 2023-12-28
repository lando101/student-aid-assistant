import { Component, Input } from '@angular/core';
import { Message } from '../../models/message.model';
import { CommonModule } from '@angular/common';
import { ScrollPanelModule } from 'primeng/scrollpanel';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { cssInfo, cssBot, cssUser } from '@ng-icons/css.gg';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule, ScrollPanelModule, NgIconComponent],
  viewProviders: [provideIcons({ cssInfo, cssBot, cssUser })],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.sass'
})
export class MessageListComponent {
  @Input() messages: Message[] = [];

}
