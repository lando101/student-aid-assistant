import { Component } from '@angular/core';
import { LoginFormComponent } from '../../chat/components/login-form/login-form.component';
import { SignupFormComponent } from '../../chat/components/signup-form/signup-form.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [LoginFormComponent, SignupFormComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.sass'
})
export class AuthComponent {

}
