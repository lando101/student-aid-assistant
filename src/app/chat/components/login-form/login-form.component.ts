import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { inject } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Auth } from '@angular/fire/auth';
import { Persistence, getAuth, provideAuth } from '@angular/fire/auth';
import { Auth, signInAnonymously, signInWithEmailAndPassword, setPersistence, browserSessionPersistence  } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule ],
  providers: [],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.sass'
})
export class LoginFormComponent {
  // private auth: Auth = inject(Auth);

  loginForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, private auth: Auth, private router: Router, private authService: AuthService) { }
  // constructor(private formBuilder: FormBuilder) { }


  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      // username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    const email: string = this.loginForm.get('email')!.value;
    const password: string = this.loginForm.get('password')!.value;
    if (this.loginForm.valid) {
      console.log(this.loginForm.value);
      // Handle the form submission
      this.authService.emailLogin(email, password).subscribe(data =>{
        if(data === true){
          console.log('login state', data)
          this.router.navigate(['/home']);
        }
      })
      // signInWithEmailAndPassword(this.auth, email, password).then((user)=>{
      //   if(user.user.uid){
      //     this.router.navigate(['/home']);
      //     console.log('user', user.user)
      //   }
      // })
    }
  }

  logout(){
    this.authService.logOut()
  }
}
