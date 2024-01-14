import { Component } from '@angular/core';
import { ChatWindowComponent } from '../../chat/components/chat-window/chat-window.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ThreadWindowComponent } from "../../chat/components/thread-window/thread-window.component";
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-home',
    standalone: true,
    templateUrl: './home.component.html',
    styleUrl: './home.component.sass',
    imports: [
        ChatWindowComponent,
        CommonModule,
        ThreadWindowComponent,
    ]
})
export class HomeComponent {

}
