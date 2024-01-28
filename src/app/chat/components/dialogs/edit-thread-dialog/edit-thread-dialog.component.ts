import { Component, Inject, OnInit, inject } from '@angular/core';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import {FormsModule} from '@angular/forms';
import { Threads } from '../../../models/user_profile.model';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { cssTrashEmpty } from '@ng-icons/css.gg';
import { featherChevronDown, featherSliders } from '@ng-icons/feather-icons';

import { LiveThread } from '../../../models/chat.model';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Assistant } from '../../../models/assistant.model';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../core/auth/user.service';

export interface Options {
  id: string,
  label: string,
}

@Component({
  selector: 'app-edit-thread-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    NgIconComponent,
    DropdownModule,
    CommonModule
  ],
  templateUrl: './edit-thread-dialog.component.html',
  styleUrl: './edit-thread-dialog.component.sass',
  viewProviders: [provideIcons({ cssTrashEmpty, featherChevronDown, featherSliders })],
})
export class EditThreadDialogComponent implements OnInit {
  thread: LiveThread | null = null;
  threadRef: LiveThread | null = null;
  userService = inject(UserService);

  assistants: Assistant[] = [
    {
      name: 'General Student Aid',
      id: 'gen_stdnt_aid',
      img: '../assets/images/books.webp',
      title: 'General Student Aid',
      desc: 'The go-to assistant for federal student aid.'
    },
    {
      name: 'FAFSA',
      id: 'fafsa',
      img: '../assets/images/form.webp',
      title: 'FAFSA',
      desc: 'Best suited for FAFSA related questions.'
    },
    {
      name: 'College Explorer',
      id: 'college_explorer',
      img: '../assets/images/school_house.webp',
      title: 'College Explorer',
      desc: 'Explore colleges that are a best fit for you.'
    },
    {
      name: 'Loans & Forgiveness',
      id: 'loan_forg',
      img: '../assets/images/loans_2.webp',
      title: 'Loans & Forgiveness',
      desc: 'Gets answers to your loan and forgiveness questions.'
    },
  ];

  toneBtns: Options[] = [
    {id: 'happy', label: 'Happy'},
    {id: 'neutral', label: 'Neutral (Default)'},
    {id: 'serious', label: 'Serious'}
  ]

  lengthBtns: Options[] = [
    // {id: 'very_short', label: 'Very Short'},
    {id: 'short', label: 'Short'},
    {id: 'medium', label: 'Medium (Default)'},
    {id: 'long', label: 'Long'},
  ]

  complexityhBtns: Options[] = [
    {id: 'child', label: '5 Year Old'},
    {id: 'adult', label: 'Adult (Default)'},
    {id: 'expert', label: 'Expert'},
  ]

  assistant: Assistant | null = null

  constructor(
    public dialogRef: MatDialogRef<EditThreadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LiveThread,
  ) {}

  ngOnInit(): void {
    this.assistant = this.assistants.find((ass)=>ass.id === this.data.assistant_type) ?? null;
    this.thread = JSON.parse(JSON.stringify(this.data));
    this.threadRef = JSON.parse(JSON.stringify(this.data));
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  setAssistant(assistant: Assistant) {
    this.assistant = assistant;
    this.threadRef!.assistant_type = assistant.id;
  }

  updateThread(){
    if(this.threadRef) {
      this.userService.updateLiveThreadTuning(this.threadRef).then(()=>{
        this.dialogRef.close();
      });
    }
  }

}
