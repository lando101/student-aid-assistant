import { Component, Inject } from '@angular/core';
import {
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { Threads } from '../../../models/user_profile.model';

import {
 cssTrashEmpty
} from '@ng-icons/css.gg';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import moment from 'moment';


@Component({
  selector: 'app-delete-dialog',
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
    NgIconComponent
  ],
  viewProviders: [provideIcons({ cssTrashEmpty })],
  templateUrl: './delete-dialog.component.html',
  styleUrl: './delete-dialog.component.sass'
})
export class DeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Threads,
  ) {}

  dateConversion(date: any): string {
    const formatted_date = moment(date, 'HH:mm:ss [GMT]Z (z)');
    // return `${formatted_date.fromNow()} (${formatted_date.format('lll')})`
    return `${formatted_date.format('lll')}`
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
