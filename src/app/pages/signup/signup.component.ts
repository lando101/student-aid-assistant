import { Component } from '@angular/core';
import { SignupFormComponent } from '../../chat/components/signup-form/signup-form.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [SignupFormComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.sass'
})
export class SignupComponent {
  image: string = 'https://firebasestorage.googleapis.com/v0/b/federal-student-aid-assistant.appspot.com/o/site_images%2Fhuman_chillin.svg?alt=media&token=8607d36b-9eec-4609-a650-a7c9a16f6994'

}
