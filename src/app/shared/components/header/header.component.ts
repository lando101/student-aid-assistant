import { Component } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { CredentialsService } from '../../../core/auth/credentials.service';
import { Router, RouterModule } from '@angular/router';
import { User } from 'firebase/auth';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/auth/user.service';
import { ThemeService } from '../../../chat/services/theme.service';
import { ButtonModule } from 'primeng/button';
import { SplitButtonModule } from 'primeng/splitbutton';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, SplitButtonModule, RatingModule, FormsModule ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.sass'
})
export class HeaderComponent {
  theme: string = 'light';
  currentUser: User | null = null;
  value!: number;

  constructor(private auth: AuthService, private userService: UserService, private themeService: ThemeService) {
    this.userService.$user.subscribe((user)=>{
      this.currentUser = user;
      console.log('header', this.currentUser)
    });

    try{
      this.themeService.themeSubject.subscribe((theme)=>{
        this.theme = theme;
        console.log('theme', this.theme)
      })
    } catch(error){
      this.theme = 'light'
    }


  }

  toggleTheme(){
    // if(this.theme === 'dark'){
    //   this.themeService.setTheme('dark')
    // }
    this.themeService.setTheme(this.theme === 'light' ? 'dark':'light')
  }

  logOut(){
    this.auth.logOut();
  }
}
