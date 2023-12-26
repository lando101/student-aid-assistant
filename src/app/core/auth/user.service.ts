import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public userSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public $user: Observable<any> = this.userSubject.asObservable();

  constructor() { }
}
