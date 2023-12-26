import { Component } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { CredentialsService } from '../../../core/auth/credentials.service';
import { Router } from '@angular/router';
import { User } from 'firebase/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.sass'
})
export class HeaderComponent {

  currentUser: User | null = null;

  constructor(private auth: AuthService, private credential:CredentialsService, private router: Router) {
    this.auth.$user.subscribe((user)=>{
      this.currentUser = user;
      console.log('header', this.currentUser)
    })
  }

  logOut(){
    this.auth.logOut();
  }
}
