import { Component } from '@angular/core';
import { ChatWindowComponent } from '../../chat/components/chat-window/chat-window.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ChatWindowComponent,
    CommonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.sass'
})
export class HomeComponent {

}
