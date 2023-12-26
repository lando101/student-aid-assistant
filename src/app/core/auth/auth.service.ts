import { Inject, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { User, user } from '@angular/fire/auth';
import { Auth, signInAnonymously, signInWithEmailAndPassword, setPersistence, browserSessionPersistence  } from '@angular/fire/auth';
import { BehaviorSubject, Observable, catchError, from, map, mergeMap, of, pipe } from 'rxjs';
import { Credentials, CredentialsService } from './credentials.service';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public $user: Observable<any> = this.userSubject.asObservable();

  constructor(private auth: Auth, private credentialService: CredentialsService, private router: Router) {

  }

  emailLogin(email: string, password: string): Observable<boolean> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map(userCredential => {
        const user = userCredential.user;
        if (user) {
          this.userSubject.next(user);
          const data: Credentials = {
            email: user.email ?? '',
            token: user.refreshToken ?? ''
          };
          this.credentialService.setCredentials(data, true);
          return true; // User is logged in :: credential service will route user home
        } else {
          this.userSubject.next(null);
          return false; // No user
        }
      }),
      catchError(error => {
        // Handle error here if needed
        this.userSubject.next(null);
        return of(false);
      })
    );
  }

  logOut(){
    this.auth.signOut();
    this.userSubject.next(null);
    this.credentialService.setCredentials();
    this.router.navigate(['/auth']);
  }
}
