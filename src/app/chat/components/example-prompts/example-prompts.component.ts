import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { cssAirplane, cssTrashEmpty, cssCopy } from '@ng-icons/css.gg';
import { NgxTypedJsModule } from 'ngx-typed-js';

@Component({
  selector: 'app-example-prompts',
  standalone: true,
  imports: [NgIconComponent, NgxTypedJsModule, CommonModule],
  viewProviders: [provideIcons({ cssAirplane, cssTrashEmpty, cssCopy })],
  templateUrl: './example-prompts.component.html',
  styleUrl: './example-prompts.component.sass'
})
export class ExamplePromptsComponent {
  typingAnimation = false;
}
