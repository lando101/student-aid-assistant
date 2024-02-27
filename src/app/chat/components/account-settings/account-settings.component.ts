import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { UserService } from '../../../core/auth/user.service';
import { AuthenticationService } from '../../../core/authentication/authentication.service';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { UserProfile } from '../../models/user_profile.model';
import { User } from 'firebase/auth';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { NgIconComponent } from '@ng-icons/core';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  providers: [MessageService],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PasswordModule, MatDividerModule, NgIconComponent, ToastModule],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.sass'
})
export class AccountSettingsComponent implements OnInit, OnDestroy{
  userService = inject(UserService);
  authService = inject(AuthenticationService)
  formBuilder = inject(FormBuilder)
  alertService = inject(AlertService);
  messageService = inject(MessageService)

  userSub!: Subscription;
  profileSub!: Subscription;

  user!: User;
  userProfile!: UserProfile;
  userForm!: FormGroup;
  userFormInitital = {
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  };

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

  close() {
    this.messageService.clear();
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
    this.profileSub.unsubscribe();
  }
}
