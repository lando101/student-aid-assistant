import { Component, OnInit, inject } from '@angular/core';
import { UserService } from '../../core/auth/user.service';
import { UserProfile } from '../../chat/models/user_profile.model';
import { User } from 'firebase/auth';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule, ValidationErrors, FormBuilder, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.sass'
})
export class SettingsComponent implements OnInit {
  userService = inject(UserService);
  formBuilder = inject(FormBuilder)

  userSub!: Subscription;
  profileSub!: Subscription;

  user!: User;
  userProfile!: UserProfile;
  passwordForm!: FormGroup;

  userForm = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    role: new FormControl('', Validators.required)
  });



  ngOnInit(): void {
    this.userSub = this.userService.$user.subscribe((user: User) => {
      this.user = user;
    });

    this.profileSub = this.userService.$userProfile.subscribe((profile: UserProfile) => {
      this.userProfile = profile;
    });



    this.passwordForm = new FormGroup({
      oldPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: this.passwordsMatchValidator }); //
  }

  ngAfterViewInit(): void {
    this.userForm.patchValue({
      firstName: this.userProfile.first_name,
      lastName: this.userProfile.last_name,
      email: this.userProfile.email,
    // role: user.role
    })
  }

  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    // Perform a type check or assert the type to FormGroup if needed
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    return newPassword && confirmPassword && newPassword === confirmPassword ? null : { passwordsDontMatch: true };
  }

  onSubmit() {
    console.log(this.userForm.value);
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
    this.profileSub.unsubscribe();
  }
}
