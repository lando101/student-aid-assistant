import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, take, map, tap } from 'rxjs';
import { CredentialsService } from './auth/credentials.service';
import { AuthService } from './auth/auth.service';
import { AuthenticationService } from './authentication/authentication.service';
import { LiveChatService } from '../chat/services/live-chat.service';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate{
  private liveChatService = inject(LiveChatService)
  // messagingService = inject();

  private authenticated: boolean = false;
  messagesLoading = this.liveChatService.messagesLoading

  constructor(private router: Router, private auth: Auth, private credentialService: CredentialsService, private authService: AuthenticationService) {
     this.authService.$currentUser.subscribe((user)=>{
      this.authenticated = !!user;
     });
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // return authState(this.auth).pipe(
    //   take(1),
    //   map(user => !!user), // map to boolean
    //   tap(loggedIn => {
    //     if (!loggedIn) {
    //       // // console.log('access denied');
    //       this.router.navigate(['/auth']);
    //     }
    //   }
    // ))
    // if (this._authState) {
    //   return true;
    // } else {
    //   this.router.navigate(['/auth']);
    //   return false
    // }
    const currentUser = this.authenticated;
    if (currentUser && !this.messagesLoading()) {
      return true;
    } else if (currentUser && this.messagesLoading()){
      // this.messageService.add({ severity: 'custom', summary: 'Info', detail: 'An assistant is responding' });

      return false
    } else {
      this.router.navigate(['/auth']);
      return false
    }

    // if (currentUser) {
    //   return true;
    // } else {
    //   this.router.navigate(['/auth']);
    //   return false
    // }

    // if(this.auth.currentUser?.uid){
    //   return true;
    // } else {
    //   this.router.navigate(['/auth']);
    //   return false
    // }
    // const isLoggedIn = this.auth.currentUser;
    // // // console.log('current user from auth', this.auth.currentUser);

    // if (!isLoggedIn) {
    //   this.router.navigate(['/auth']);
    //   return false;
    // }
    // return true;
  }
}
