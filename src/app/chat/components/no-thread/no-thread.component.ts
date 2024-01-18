import { Component, OnInit, inject } from '@angular/core';
import { LoaderComponent } from "../../../shared/components/loader/loader.component";
import { ExamplePromptsComponent } from "../example-prompts/example-prompts.component";
import { AssistantService } from '../../services/assistant.service';

@Component({
    selector: 'app-no-thread',
    standalone: true,
    templateUrl: './no-thread.component.html',
    styleUrl: './no-thread.component.sass',
    imports: [LoaderComponent, ExamplePromptsComponent]
})
export class NoThreadComponent implements OnInit {
  chatService = inject(AssistantService)

  ngOnInit(): void {
    this.chatService.activeThread.set(null)
  }
}
