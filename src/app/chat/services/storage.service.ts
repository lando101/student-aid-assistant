import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  setItem(key: string, value: string, doNotRemember?: boolean) {
    if (isPlatformBrowser(this.platformId)) {
      if(doNotRemember) {
        sessionStorage.setItem(key,value);
      } else {
        localStorage.setItem(key, value);
        sessionStorage.setItem(key,value);
      }
    }
  }

  getItem(key: string): string | null {
    try {
      if (isPlatformBrowser(this.platformId)) {
        return sessionStorage.getItem(key) || localStorage.getItem(key);
      }
      return null;
    } catch (error) {
      return null
    }

  }

  removeItem(key: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key)
    }
  }
}
