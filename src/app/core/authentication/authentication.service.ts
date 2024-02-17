import { HttpClient, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Injectable, OnInit, inject } from '@angular/core';
import { Auth, User, UserCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateEmail, updatePassword } from '@angular/fire/auth';
import { BehaviorSubject, Observable, from, map, of } from 'rxjs';
import { StorageService } from '../../chat/services/storage.service';
import {  } from 'firebase/firestore';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  userKey: string = "user";
  currentUser: User | null = null;

  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<any>(null);
  public $currentUser: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private auth: Auth, private storageService: StorageService, private router: Router) {
    try {
      const user = this.storageService.getItem(this.userKey);
      // const userJSON = JSON.parse(user ?? '')
      // // console.log('storage', userJSON)
      if(!!user){
        this.currentUser = JSON.parse(user);
        this.currentUserSubject.next(this.currentUser);
      } else {
        this.currentUser = null;
        this.currentUserSubject.next(null);
      }
    } catch (error) {
      this.currentUser = null;
      this.currentUserSubject.next(null);
    }
  }



  // simple boolean to check auth state
  isAuthenticated() {
    return this.currentUserSubject.value;
  }

  // email login
  async emailLogin(email: string, password: string): Promise<User | null> {
   return await signInWithEmailAndPassword(this.auth, email, password).then((user)=>{
      const userRef = user.user;
      // console.log('email login', userRef);
      if(!!userRef){
        this.storageService.setItem(this.userKey, JSON.stringify(userRef));
        this.currentUserSubject.next(userRef);
        return userRef
      } else {
        return null
      }
    })
  }

  // create account :: email & password
  async createAccountEmail(profile: {email: string, password: string, firstName: string, lastName: string}, formgGroup?: FormGroup): Promise<User | null> {
    const email = profile.email;
    const password = profile.password;
    const firstName = profile.firstName;
    const lastName = profile.lastName;

    return await createUserWithEmailAndPassword(this.auth, email, password).then((user)=>{
      const userRef = user.user;
      if(!!userRef){
        this.storageService.setItem(this.userKey, JSON.stringify(userRef));
        this.currentUserSubject.next(userRef);
        return userRef
      } else {
        return null
      }
    })
  }

  // update user's password
  async updateUserPassword(newPassword: string) {
    return await updatePassword(this.auth.currentUser!, newPassword).then((data)=>{
      return data
    }).catch((error)=>{
      return error
    })
  }

  // update user's email
  async updateUserEmail(newEmail: string) {
    return await updateEmail(this.auth.currentUser!, newEmail).then((data)=>{
      return data
    }).catch((error)=>{
      return error
    })
  }

  // logout
  async logOut() {
    this.auth.signOut();
    this.currentUserSubject.next(null);
    this.storageService.removeItem(this.userKey);
    this.router.navigate(['/auth']);
  }
}
