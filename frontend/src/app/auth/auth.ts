import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css'],
})
export class Auth {
  private readonly http = inject(HttpClient);
  protected mode = signal<'login' | 'register'>('login');
  protected isSubmitting = signal(false);
  protected errorMessage = signal<string | null>(null);
  protected successMessage = signal<string | null>(null);
  private readonly router = inject(Router);

  protected loginForm = { username: '', password: '' };
  protected registerForm = { username: '', email: '', password: '' };


  ngOnInit() {
    const token = typeof window !== 'undefined'
      ? window.localStorage.getItem('auth_token')
      : null;

    if (token) {
      this.router.navigate(['/']);
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
      this.http.post<AuthResponse>('http://localhost:8080/api/auth/login', this.loginForm).subscribe({
        next: (res) => {
          console.log(res);
          if (res.jwt) {
            if (typeof window !== 'undefined') {
              window.localStorage.setItem('auth_token', res.jwt);
            }
            this.successMessage.set('Login successful!');
            this.router.navigate(['/']);
          }
        }
      })
    } catch (error) {

    }

  }

  protected submitRegister() {
    try {
      this.http.post<AuthResponse>('http://localhost:8080/api/auth/register', this.registerForm).subscribe({
        next: (res) => {
          console.log(res);
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
