import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { inject } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Auth } from '@angular/fire/auth';
import { Persistence, getAuth, provideAuth } from '@angular/fire/auth';
import { Auth, signInAnonymously, signInWithEmailAndPassword, setPersistence, browserSessionPersistence  } from '@angular/fire/auth';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule ],
  providers: [],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.sass'
})
export class LoginFormComponent {
  // private auth: Auth = inject(Auth);

  loginForm!: FormGroup;
  authenticated: boolean = false;
  constructor(private formBuilder: FormBuilder, private auth: Auth, private router: Router, private authService: AuthService) { }
  // constructor(private formBuilder: FormBuilder) { }


  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      // username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.authService.$authState.subscribe((state)=>{
      this.authenticated = state;
    })
  }

  onSubmit(): void {
    const email: string = this.loginForm.get('email')!.value;
    const password: string = this.loginForm.get('password')!.value;
    if (this.loginForm.valid) {
      // Handle the form submission
      this.authService.emailLogin(email, password).subscribe(data =>{
          console.log('login state', data)

        if(data){
          this.router.navigate(['/home']);
        }
      })
    }
  }

  logout(){
    this.authService.logOut()
  }
}
