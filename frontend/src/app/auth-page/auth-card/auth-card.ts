import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type AuthMode = 'login' | 'register';

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

interface LoginPayload {
  username: string;
  password: string;
}

interface AuthResponse {
  id: number;
  username: string;
  jwt: string;
}

@Component({
  selector: 'app-auth-card',
  imports: [FormsModule],
  templateUrl: './auth-card.html',
  styleUrl: './auth-card.css',
})
export class AuthCard {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://localhost:8080';
  private readonly storage = typeof window !== 'undefined' ? window.localStorage : null;

  protected readonly mode = signal<AuthMode>('login');
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly hasSession = signal(Boolean(this.storage?.getItem('auth_token')));
  protected readonly currentUsername = signal(this.storage?.getItem('auth_username') ?? '');

  protected readonly loginForm: LoginPayload = {
    username: '',
    password: ''
  };

  protected readonly registerForm: RegisterPayload = {
    username: '',
    email: '',
    password: ''
  };

  protected setMode(mode: AuthMode): void {
    this.mode.set(mode);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  protected submitLogin(): void {
    if (!this.loginForm.username.trim() || !this.loginForm.password.trim()) {
      this.errorMessage.set('Username and password are required.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.http.post<AuthResponse>(`${this.apiBaseUrl}/api/auth/login`, this.loginForm).subscribe({
      next: (response) => {
        this.storeSession(response);
        this.successMessage.set(`Signed in as ${response.username}.`);
        this.isSubmitting.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Login failed.'));
        this.isSubmitting.set(false);
      }
    });
  }

  protected submitRegister(): void {
    if (!this.registerForm.username.trim() || !this.registerForm.email.trim() || !this.registerForm.password.trim()) {
      this.errorMessage.set('Username, email, and password are required.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.http.post<AuthResponse>(`${this.apiBaseUrl}/api/auth/register`, this.registerForm).subscribe({
      next: (response) => {
        this.storeSession(response);
        this.successMessage.set(`Account created for ${response.username}.`);
        this.registerForm.password = '';
        this.mode.set('login');
        this.loginForm.username = response.username;
        this.isSubmitting.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Registration failed.'));
        this.isSubmitting.set(false);
      }
    });
  }

  protected signOut(): void {
    this.storage?.removeItem('auth_token');
    this.storage?.removeItem('auth_username');
    this.storage?.removeItem('auth_user_id');
    this.hasSession.set(false);
    this.currentUsername.set('');
    this.successMessage.set('Signed out.');
  }

  private storeSession(response: AuthResponse): void {
    this.storage?.setItem('auth_token', response.jwt);
    this.storage?.setItem('auth_username', response.username);
    this.storage?.setItem('auth_user_id', String(response.id));
    this.hasSession.set(true);
    this.currentUsername.set(response.username);
  }

  private getErrorMessage(error: HttpErrorResponse, fallback: string): string {
    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    if (error.error?.message) {
      return error.error.message;
    }

    if (error.status === 0) {
      return 'Cannot reach backend at http://localhost:8080.';
    }

    return fallback;
  }
}
