import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Navbar } from '../home/navbar/navbar';
import { HttpClient } from '@angular/common/http';
import { UserProfileResponse } from '../models/user';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [Navbar,NgFor, NgIf],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  public users: UserProfileResponse[] = [];

  getRoleFromToken(token: string): string | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.role;
    } catch (e) {
      return null;
    }
  }
  ngOnInit() {
    const token = window.localStorage.getItem('auth_token')
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    const role = this.getRoleFromToken(token);
    if (role !== 'ADMIN') {
      this.router.navigate(['/']);
      return;
    }
    this.http.get('http://localhost:8080/api/users/admin').subscribe({
      next: (response) => {
        this.users = response as UserProfileResponse[];
        console.log(this.users);
        
      },
      error: (error) => {
        console.error('Error fetching admin data:', error);
      }
    });

  }
}
