import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  public alertSubject: BehaviorSubject<any> = new BehaviorSubject<boolean | null>(null);
  public alert$: Observable<any> = this.alertSubject.asObservable();

  constructor() {

  }
}
