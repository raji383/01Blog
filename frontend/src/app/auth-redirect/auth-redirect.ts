import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-redirect',
  templateUrl: './auth-redirect.html',
  styleUrl: './auth-redirect.css',
})
export class AuthRedirect {
  private readonly router = inject(Router);
  private readonly storage = typeof window !== 'undefined' ? window.localStorage : null;

  constructor() {
    this.redirect();
  }

  private redirect(): void {
    const token = this.storage?.getItem('auth_token');
    try {
      if (token) {
        this.router.navigate(['/']);
      } else {
        this.router.navigate(['/login']);
      }
    } catch {
      if (typeof window !== 'undefined') {
        window.location.href = token ? '/' : '/login';
      }
    }
  }
}
