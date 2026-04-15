import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthBrandPanel } from './auth-brand-panel/auth-brand-panel';
import { AuthCard } from './auth-card/auth-card';

@Component({
  selector: 'app-auth-page',
  imports: [AuthBrandPanel, AuthCard],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.css',
})
export class AuthPage implements OnInit {
  private readonly router = inject(Router);

  ngOnInit(): void {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;
    if (token) {
      try {
        this.router.navigate(['/']);
      } catch {
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    }
  }
}
