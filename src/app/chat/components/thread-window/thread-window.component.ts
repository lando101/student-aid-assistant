import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgIconComponent } from '@ng-icons/core';

@Component({
  selector: 'app-thread-window',
  standalone: true,
  imports: [
    CommonModule,
    NgIconComponent,
    MatIconModule,

  ],
  templateUrl: './thread-window.component.html',
  styleUrl: './thread-window.component.sass'
})
export class ThreadWindowComponent {

}
