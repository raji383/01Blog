import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, NgIf],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly router = inject(Router);

  private readonly storage = typeof window !== 'undefined' ? window.localStorage : null;
  protected readonly hasSession = signal(Boolean(this.storage?.getItem('auth_token')));

  signOut(): void {
    if (typeof window !== 'undefined') {
      this.storage?.removeItem('auth_token');
      this.storage?.removeItem('auth_username');
      this.storage?.removeItem('auth_user_id');
    }
    this.hasSession.set(false);
    try {
      this.router.navigate(['/login']);
    } catch {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }
}
