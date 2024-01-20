import { Component } from '@angular/core';
import { LiveChatComponent } from "../../chat/components/live-chat/live-chat.component";

@Component({
    selector: 'app-about',
    standalone: true,
    templateUrl: './about.component.html',
    styleUrl: './about.component.sass',
    imports: [LiveChatComponent]
})
export class AboutComponent {

}
