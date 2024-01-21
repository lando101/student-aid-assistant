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
import { SelectButtonModule } from 'primeng/selectbutton';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { cssSun, cssMoon, cssMenu } from '@ng-icons/css.gg';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api/menuitem';
import { SidebarModule } from 'primeng/sidebar';
import { AuthenticationService } from '../../../core/authentication/authentication.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, SplitButtonModule, RatingModule, FormsModule, SelectButtonModule, NgIconComponent, MenuModule, SidebarModule, MatMenuModule, MatButtonModule, MatIconModule ],
  viewProviders: [provideIcons({ cssSun, cssMoon, cssMenu })],
  templateUrl: './header.component.html',
  styleUrl: './header.component.sass'
})
export class HeaderComponent {
  stateOptions: any[] = [{label: '', value: 'off'}, {label: 'On', value: 'on'}];
  items: MenuItem[] | undefined;
  sidebarVisible: boolean = false;

  theme: string = 'light';
  currentUser: User | null = null;
  value!: number;

  constructor(private auth: AuthService, private userService: UserService, private themeService: ThemeService, private authService: AuthenticationService) {
    // this.userService.$user.subscribe((user)=>{
    //   this.currentUser = user;
    //   // // console.log('header', this.currentUser)
    // });

    this.authService.$currentUser.subscribe((user)=>{
      // console.log('header user', user)
      if(!!user) {
        this.currentUser = user;
      } else {
        this.currentUser = null
      }
    })

    try{
      this.themeService.themeSubject.subscribe((theme)=>{
        this.theme = theme;
        // // console.log('theme', this.theme)
      })
    } catch(error){
      this.theme = 'light'
    }

    this.items = [
      {
          label: 'Navigation',
          items: [
              {
                  label: 'Update',
                  icon: 'pi pi-refresh',
                  command: () => {
                      this.toggleTheme();
                  }
              },
              {
                  label: 'Delete',
                  icon: 'pi pi-times',
                  command: () => {
                      this.logOut();
                  }
              }
          ]
      },
      {
          label: 'Navigate',
          items: [
              {
                  label: 'Angular',
                  icon: 'pi pi-external-link',
                  url: 'http://angular.io'
              },
              {
                  label: 'Router',
                  icon: 'pi pi-upload',
                  routerLink: '/fileupload'
              }
          ]
      }
  ];
  }

  toggleTheme(){
    // if(this.theme === 'dark'){
    //   this.themeService.setTheme('dark')
    // }
    this.themeService.setTheme(this.theme === 'light' ? 'dark':'light')
  }

  logOut(){
    this.authService.logOut();
  }
}
