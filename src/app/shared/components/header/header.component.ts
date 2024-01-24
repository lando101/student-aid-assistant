import { Component, OnInit, inject } from '@angular/core';
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
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LiveChatService } from '../../../chat/services/live-chat.service';

@Component({
  selector: 'app-header',
  standalone: true,
  providers: [MessageService],
  imports: [CommonModule, RouterModule, ButtonModule, SplitButtonModule, RatingModule, FormsModule, SelectButtonModule, NgIconComponent, MenuModule, SidebarModule, MatMenuModule, MatButtonModule, MatIconModule, ToastModule ],
  viewProviders: [provideIcons({ cssSun, cssMoon, cssMenu })],
  templateUrl: './header.component.html',
  styleUrl: './header.component.sass'
})
export class HeaderComponent implements OnInit {
  stateOptions: any[] = [{label: '', value: 'off'}, {label: 'On', value: 'on'}];
  items: MenuItem[] | undefined;
  sidebarVisible: boolean = false;
  messageService = inject(MessageService)
  chatService = inject(LiveChatService)

  theme: string = 'light';
  currentUser: User | null = null;
  value!: number;
  messageLoading = this.chatService.messagesLoading;

  constructor(private nav: Router, private auth: AuthService, private userService: UserService, private themeService: ThemeService, private authService: AuthenticationService) {
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

  ngOnInit(): void {

  }

  toggleTheme(){
    // if(this.theme === 'dark'){
    //   this.themeService.setTheme('dark')
    // }
    this.themeService.setTheme(this.theme === 'light' ? 'dark':'light')
  }

  navigate(url?: string){
    if(!this.messageLoading()) {
      if(url){
        // this.chatService.activeThread.set(thread ?? null)
        this.nav.navigateByUrl(url)
      } else {
        this.nav.navigateByUrl('/assistant')
      }
    } else {
      this.messageService.add({ severity: 'custom', summary: 'Info', detail: 'An assistant is responding' });
    }
  }

  close() {
    this.messageService.clear();
  }

  logOut(){
    this.authService.logOut();
  }
}
