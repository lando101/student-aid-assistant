import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, take, map, tap } from 'rxjs';
import { CredentialsService } from './auth/credentials.service';
import { AuthService } from './auth/auth.service';
import { AuthenticationService } from './authentication/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate{

  private authenticated: boolean = false;

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
    if (currentUser) {
      return true;
    } else {
      this.router.navigate(['/auth']);
      return false
    }

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
