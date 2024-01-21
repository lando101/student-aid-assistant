import { Inject, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { User, user } from '@angular/fire/auth';
import { Auth, signInAnonymously, signInWithEmailAndPassword, setPersistence, browserSessionPersistence, authState  } from '@angular/fire/auth';
import { BehaviorSubject, Observable, catchError, from, map, mergeMap, of, pipe } from 'rxjs';
import { Credentials, CredentialsService } from './credentials.service';
import { Router } from '@angular/router';
import { UserService } from './user.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public _authState: BehaviorSubject<any> = new BehaviorSubject<boolean>(false);
  public $authState: Observable<boolean> = this._authState.asObservable();



  constructor(private auth: Auth, private credentialService: CredentialsService, private router: Router, private userService: UserService) {
    // this.auth.onAuthStateChanged((state) => {
    //   // // console.log('Auth state changed', state)
    // })
    authState(this.auth).subscribe((data)=>{
      if(!data){
        // this.logOut();
      }
      this._authState.next(!!data)
    })
  }

  emailLogin(email: string, password: string): Observable<boolean> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map(userCredential => {
        const user = userCredential.user;
        if (user) {
          this.userService.userSubject.next(user);
          const data: Credentials = {
            email: user.email ?? '',
            token: user.refreshToken ?? ''
          };
          this.credentialService.setCredentials(data, true, user);
          return true; // User is logged in :: credential service will route user home
        } else {
          this.userService.userSubject.next(null);
          return false; // No user
        }
      }),
      catchError(error => {
        // Handle error here if needed
        this.userService.userSubject.next(null);
        return of(false);
      })
    );
  }

  logOut(){
    this.auth.signOut();
    this.userService.userSubject.next(null);
    this.credentialService.setCredentials();
    this.router.navigate(['/auth']);
  }
}
