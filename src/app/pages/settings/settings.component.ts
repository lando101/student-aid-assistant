import { Component, OnInit, inject } from '@angular/core';
import { UserService } from '../../core/auth/user.service';
import { UserProfile } from '../../chat/models/user_profile.model';
import { User } from 'firebase/auth';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule, ValidationErrors, FormBuilder, AbstractControl, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PasswordModule } from 'primeng/password';
import { MatDividerModule } from '@angular/material/divider';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { featherCheckCircle, featherXCircle } from '@ng-icons/feather-icons';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { AlertService } from '../../chat/services/alert.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AccountSettingsComponent } from "../../chat/components/account-settings/account-settings.component";

export interface Reqs {
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumeric: boolean;
  hasMinLength: boolean;
}

@Component({
    selector: 'app-settings',
    standalone: true,
    providers: [MessageService],
    viewProviders: [
        provideIcons({
            featherCheckCircle,
            featherXCircle
        }),
    ],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.sass',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, PasswordModule, MatDividerModule, NgIconComponent, ToastModule, AccountSettingsComponent]
})
export class SettingsComponent implements OnInit {
  userService = inject(UserService);
  authService = inject(AuthenticationService)
  formBuilder = inject(FormBuilder)
  alertService = inject(AlertService);
  messageService = inject(MessageService)

  userSub!: Subscription;
  profileSub!: Subscription;

  user!: User;
  userProfile!: UserProfile;
  passwordForm!: FormGroup;
  userForm!: FormGroup;
  userFormInitital = {
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  };

  hasUpperCase: boolean = false;
  hasLowerCase: boolean = false;
  hasNumeric: boolean = false;
  hasMinLength: boolean = false;
  newPasswordStr: string = '';
  reqs!: Reqs;

  ngOnInit(): void {
    this.userSub = this.userService.$user.subscribe((user: User) => {
      this.user = user;
    });

    this.profileSub = this.userService.$userProfile.subscribe((profile: UserProfile) => {
      this.userProfile = profile;
      console.log('profile', profile)

      this.userFormInitital = {
        firstName: profile.first_name ?? '',
        lastName: profile.last_name ?? '',
        email: profile.email ?? '',
        role: profile.role ?? ''
      }
    });


    this.userForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl({value:'', disabled: true}, [Validators.required, Validators.email]),
      role: new FormControl('', Validators.required)
    }, { validators: this.checkIfFormChanged(this.userFormInitital) });

    this.passwordForm = new FormGroup({
      oldPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required, this.passwordStrengthValidator]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: this.passwordsMatchValidator }); //
  }

  ngAfterViewInit(): void {
    console.log(this.userProfile)
    this.userForm.patchValue({
      firstName: this.userProfile.first_name,
      lastName: this.userProfile.last_name,
      email: this.userProfile.email,
      role: this.userProfile.role
    })

    console.log(this.userForm)
  }

  checkIfFormChanged(initialValues: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const group = control as FormGroup; // Cast AbstractControl to FormGroup
      let isChanged = false;
      Object.keys(group.controls).forEach(key => {
        const currentControl = group.get(key);
        if (currentControl && initialValues[key] !== currentControl.value) {
          isChanged = true;
        }
      });
      return !isChanged ? { 'unchanged': true } : null;
    };
  }

  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    // Perform a type check or assert the type to FormGroup if needed
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    return newPassword && confirmPassword && newPassword === confirmPassword ? null : { passwordsDontMatch: true };
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value || '';
    const errors: ValidationErrors = {};

    const hasUpperCase = /[A-Z]+/.test(value);
    const hasLowerCase = /[a-z]+/.test(value);
    const hasNumeric = /[0-9]+/.test(value);
    const hasMinLength = value.length >= 8;

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasMinLength;

    if (!/[a-z]+/.test(value)) {
      errors['lowercase'] = 'Password must contain at least one lowercase letter';
    }
    if (!/[A-Z]+/.test(value)) {
      errors['uppercase'] = 'Password must contain at least one uppercase letter';
    }
    if (!/[0-9]+/.test(value)) {
      errors['numeric'] = 'Password must contain at least one numeric character';
    }
    if (value.length < 8) {
      errors['minLength'] = 'Password must be at least 8 characters long';
    }
    if (!passwordValid) {
      errors['passwordStrength'] = 'Passwords do not match';
    }

    return Object.keys(errors).length ? errors : null;

    // return !passwordValid ? { passwordStrength: true } : null;
  }

  passwordReqs(password: string) {
    let reqs: Reqs = {
      hasUpperCase: /[A-Z]+/.test(password),
      hasLowerCase: /[a-z]+/.test(password),
      hasNumeric: /[0-9]+/.test(password),
      hasMinLength: password.length >= 8
    }

    this.reqs = reqs;
    // return reqs
  }

  updateAccount() {
    console.log(this.userForm.value);
    const firstName = this.userForm.get('firstName')?.value;
    const lastName = this.userForm.get('lastName')?.value;
    const role = this.userForm.get('role')?.value;
    let userProfile: UserProfile;

    if(firstName && lastName && role){
      userProfile = {
        email: this.userProfile.email,
        first_name: firstName,
        last_name: lastName,
        image: null,
        last_login: null,
        role: role,
        threads: null,
        live_threads: null,
        uid: this.userProfile.uid
      }
    this.userService.updateUser(userProfile.uid!, null, null, userProfile).then((profile)=>{
      console.log('profile', profile)

      this.userForm.reset();
      this.userForm = new FormGroup({
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        email: new FormControl({value:'', disabled: true}, [Validators.required, Validators.email]),
        role: new FormControl('', Validators.required)
      }, { validators: this.checkIfFormChanged(this.userFormInitital) });

       this.userForm.patchValue({
          firstName: this.userProfile.first_name,
          lastName: this.userProfile.last_name,
          email: this.userProfile.email,
          role: this.userProfile.role
        });

        this.messageService.add({ severity: 'custom', summary: 'Info', detail: 'Password updated!' });
    })
    }
  }

  updatePassword(){
    const oldPassword = this.passwordForm.get('oldPassword')?.value;
    const newPassword = this.passwordForm.get('newPassword')?.value;

    if(this.userProfile.email){
      this.authService.emailLogin(this.userProfile.email, oldPassword).then((user)=>{
        if(user){
          this.authService.updateUserPassword(newPassword).then((data)=>{
            this.messageService.add({ severity: 'custom', summary: 'Info', detail: 'Password updated!' });
            this.passwordForm.reset();
          })
        }
      })
    }
  }

  close() {
    this.messageService.clear();
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
    this.profileSub.unsubscribe();
  }
}
