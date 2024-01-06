import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgIconComponent } from '@ng-icons/core';
import { FormControl, Validators } from '@angular/forms';
import { Threads } from '../../../models/user_profile.model';
import { CommonModule } from '@angular/common';
import moment from 'moment';

@Component({
  selector: 'app-rename-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    NgIconComponent,
    ReactiveFormsModule
  ],
  templateUrl: './rename-dialog.component.html',
  styleUrl: './rename-dialog.component.sass'
})
export class RenameDialogComponent implements  OnInit {
  threadNameControl!: FormControl;


  constructor(
    public dialogRef: MatDialogRef<RenameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Threads,
  ) {}

  ngOnInit(): void{
    this.threadNameControl = new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ]);
  }

  onSubmit() {
    if (this.threadNameControl.valid) {
      console.log('Thread Name:', this.threadNameControl.value);
      // Additional submit logic
    }
  }

  dateConversion(date: any): string {
    const formatted_date = moment(date, 'HH:mm:ss [GMT]Z (z)');
    // return `${formatted_date.fromNow()} (${formatted_date.format('lll')})`
    return `${formatted_date.format('lll')}`
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
