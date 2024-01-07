import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth, signInAnonymously, createUserWithEmailAndPassword } from '@angular/fire/auth';
import {MatDividerModule} from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../core/auth/user.service';
import { AuthenticationService } from '../../../core/authentication/authentication.service';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDividerModule, RouterModule],
  templateUrl: './signup-form.component.html',
  styleUrl: './signup-form.component.sass'
})
export class SignupFormComponent {
  signupForm!: FormGroup;
  image: string = 'https://firebasestorage.googleapis.com/v0/b/federal-student-aid-assistant.appspot.com/o/site_images%2Fhuman_chillin.svg?alt=media&token=8607d36b-9eec-4609-a650-a7c9a16f6994'
  uid: string | null = null;
  constructor(private formBuilder: FormBuilder, private auth: Auth, private userService: UserService, private authNew: AuthenticationService) { }

  ngOnInit(): void {
    this.signupForm = this.formBuilder.group({
      // username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      firstName: [''], // Optional field for first name
      lastName: ['']   // Optional field for last name
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
    console.log(this.signupForm.value);

    const email: string = this.signupForm.get('email')!.value.trim();
    const password: string = this.signupForm.get('password')!.value.trim();
    const firstName: string = this.signupForm.get('firstName')!.value.trim();
    const lastName: string = this.signupForm.get('lastName')!.value.trim();

    let profile = {
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName
    }


    if (this.signupForm.valid) {
      console.log(this.signupForm.value);
      // createUserWithEmailAndPassword(this.auth, email, password).then((data)=> {
      //   console.log('signup', data);
      //   this.uid = data.user.uid
      //   this.userService.createUserProfile(this.uid, email).then(()=>{
      //     this.userService.updateUser(this.uid ?? '', 'first_name', firstName)
      //     .then(()=>{
      //       this.userService.updateUser(this.uid ?? '', 'last_name', lastName)
      //     })
      //   })
      //   // console.log('email', this.auth.currentUser?.email);
      // }).catch(error => {
      //   alert('error creating account')
      // })

      // Handle the form submission
      // this.authService.SignUp(this.signupForm.get('email')?.value, this.signupForm.get('password')?.value);
      this.authNew.createAccountEmail(profile).then((user)=>{
        this.userService.createUserProfile(profile, user!.uid)
        .then((data)=>{

        })
      });
    }
  }
}
