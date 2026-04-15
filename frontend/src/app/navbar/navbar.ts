import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private readonly router = inject(Router);

  signOut(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('auth_token');
      window.localStorage.removeItem('auth_username');
      window.localStorage.removeItem('auth_user_id');
    }
    try {
      this.router.navigate(['/login']);
    } catch {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }
}
