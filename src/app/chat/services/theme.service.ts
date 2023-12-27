import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeKey = 'user-theme';
  public themeSubject = new BehaviorSubject<string>(this.getStoredTheme());

  constructor(private storage: StorageService, @Inject(PLATFORM_ID) private platformId: Object) {
    this.applyTheme(this.getStoredTheme());
  }

  private loadTheme(): void {
    const cachedTheme = this.storage.getItem(this.themeKey) || 'light';
    this.applyTheme(cachedTheme);
  }

  setTheme(theme: string): void {
    this.storage.setItem(this.themeKey, theme);
    this.themeSubject.next(theme);
    this.applyTheme(theme);
  }

  private getStoredTheme(): string {
    let theme: string;
    try {
    theme = this.storage.getItem(this.themeKey) || 'light'
    return theme;

    } catch (error) {
      return 'light'
    }
  }

  private applyTheme(theme: string): void {
    if (isPlatformBrowser(this.platformId)){
      const body = document.body;
      body.classList.remove('light', 'dark'); // Add all your theme classes here
      body.classList.add(theme);
    }
  }
}
