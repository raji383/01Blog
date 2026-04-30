import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import type { AuthResponse, PostResponse } from '../models/user';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css'],
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  protected mode = signal<'login' | 'register'>('login');
  protected isSubmitting = signal(false);
  protected errorMessage = signal<string | null>(null);
  protected successMessage = signal<string | null>(null);
  private readonly router = inject(Router);

  protected loginForm = { username: '', password: '' };
  protected registerForm = { username: '', email: '', password: '' };


  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const token = window.localStorage.getItem('auth_token');

    if (token) {
      this.http.get<PostResponse[]>('/api/posts/feed').subscribe({
        next: (res) => {
          console.log(res);
          
          this.router.navigate(['/']);

        },
        error: (err) => {
          if (err.status === 401) {
            this.router.navigate(['/login']);

          }else if (err.status===403) {
            window.alert('Your account is banned. Please contact support for more information.');
            this.router.navigate(['/login']);
          } else {
            console.error('Error fetching posts:', err);
          }
        }
      });
      return;
    }
  }

  protected setMode(m: 'login' | 'register') {
    this.mode.set(m);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  protected submitLogin() {

    try {
      this.http.post<AuthResponse>('/api/auth/login', this.loginForm).subscribe({
        next: (res) => {
          if (res.jwt) {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('auth_token', res.jwt);
            }
            this.successMessage.set('Login successful!');
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
           if (err.status === 401) {
            this.router.navigate(['/login']);

          }else if (err.status===403) {
            window.alert('Your account is banned. Please contact support for more information.');
            this.router.navigate(['/login']);
          } else {
            console.error('Error to login:', err);
          }
        }
      })
    } catch (error) {

    }

  }

  protected submitRegister() {
    try {
      this.http.post<AuthResponse>('/api/auth/register', this.registerForm).subscribe({
        next: (res) => {
          if (res.jwt) {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('auth_token', res.jwt);
            }
            this.successMessage.set('Registration successful!');
            this.router.navigate(['/']);
          }
        }
      })
    } catch (error) {

    }
  }
}
