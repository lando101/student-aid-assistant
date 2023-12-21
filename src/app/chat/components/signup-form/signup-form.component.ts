import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup-form.component.html',
  styleUrl: './signup-form.component.sass'
})
export class SignupFormComponent {
  signupForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, private authService: AuthService) { }

  ngOnInit(): void {
    this.signupForm = this.formBuilder.group({
      // username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.checkPasswords });
  }

  checkPasswords(group: FormGroup): ValidationErrors | null {
    const passControl = group.get('password');
    const confirmPassControl = group.get('confirmPassword');

    if (!passControl || !confirmPassControl) {
      // One of the form controls is not found, return an error or null
      return { controlNotFound: true };
    }

    const pass = passControl.value;
    const confirmPass = confirmPassControl.value;

    return pass === confirmPass ? null : { notSame: true };
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      console.log(this.signupForm.value);
      // Handle the form submission
      // this.authService.SignUp(this.signupForm.get('email')?.value, this.signupForm.get('password')?.value);
    }
  }
}
