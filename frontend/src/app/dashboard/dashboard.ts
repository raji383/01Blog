import { Component, inject } from '@angular/core';
import { NgFor } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Navbar } from '../home/navbar/navbar';

@Component({
  selector: 'app-dashboard',
  imports: [Navbar, RouterOutlet, RouterLink, RouterLinkActive, NgFor],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly router = inject(Router);

  protected readonly sections = [
    { label: 'Users', path: '/admin/users', description: 'Accounts, roles, and status' },
    { label: 'Posts', path: '/admin/posts', description: 'All published content' },
    { label: 'Reports', path: '/admin/reports', description: 'Flagged user reports' },
  ];

  ngOnInit() {
    const token = window.localStorage.getItem('auth_token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const role = this.getRoleFromToken(token);
    if (role !== 'ADMIN') {
      this.router.navigate(['/']);
    }
  }

  private getRoleFromToken(token: string): string | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.role;
    } catch (e) {
      return null;
    }
  }
}
