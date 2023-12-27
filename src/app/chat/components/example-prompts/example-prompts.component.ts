import { Component } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { cssAirplane, cssTrashEmpty, cssCopy } from '@ng-icons/css.gg';

@Component({
  selector: 'app-example-prompts',
  standalone: true,
  imports: [NgIconComponent],
  viewProviders: [provideIcons({ cssAirplane, cssTrashEmpty, cssCopy })],
  templateUrl: './example-prompts.component.html',
  styleUrl: './example-prompts.component.sass'
})
export class ExamplePromptsComponent {

}
