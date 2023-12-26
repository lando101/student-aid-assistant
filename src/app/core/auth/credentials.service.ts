import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

export interface Credentials {
  // Customize received credentials here
  email: string;
  token: string;
}

const credentialsKey = 'credentials';
const userKey = 'user'

@Injectable({
  providedIn: 'root'
})
export class CredentialsService {
  private _credentials: Credentials | null = null;
  private _user: User | null = null

  constructor( private userService: UserService) {
    try {
      const savedCredentials = sessionStorage.getItem(credentialsKey) || localStorage.getItem(credentialsKey);
      const savedUser = sessionStorage.getItem(userKey) || localStorage.getItem(userKey);
      if (savedCredentials && savedUser) {
        this._credentials = JSON.parse(savedCredentials);
        this._user = JSON.parse(savedUser);
        this.userService.userSubject.next(this._user);
      }
    } catch (error) {
        this._credentials = null
        this._user = null;
    }

   }

  /**
   * Checks is the user is authenticated.
   * @return True if the user is authenticated.
   */
  isAuthenticated(): boolean {
    if(this._credentials && this._user){
      console.log("cred", this._user)
      return true;
    } else {
      return false;
    }
    // return !!this._credentials;
  }

    /**
   * Gets the user credentials.
   * @return The user credentials or null if the user is not authenticated.
   */
    get credentials(): Credentials | null {
      return this._credentials;
    }

    /**
     * Sets the user credentials.
     * The credentials may be persisted across sessions by setting the `remember` parameter to true.
     * Otherwise, the credentials are only persisted for the current session.
     * @param credentials The user credentials.
     * @param remember True to remember credentials across sessions.
     */
    setCredentials(credentials?: Credentials, remember?: boolean, user?: User) {
      this._credentials = credentials || null;

      if (credentials) {
        const storage = remember ? localStorage : sessionStorage;
        storage.setItem(credentialsKey, JSON.stringify(credentials));
        storage.setItem(userKey, JSON.stringify(user));
      } else {
        sessionStorage.removeItem(credentialsKey);
        localStorage.removeItem(credentialsKey);
        sessionStorage.removeItem(userKey);
        localStorage.removeItem(userKey);
      }
    }
}
