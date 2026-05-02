import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import type { AuthResponse } from '../models/user';
import { UserService } from '../Service/UserService';
import { ToastService } from '../shared/ui/toast/toast.service';

interface ApiErrorResponse {
  message?: string;
  errors?: string[];
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css'],
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  protected mode = signal<'login' | 'register'>('login');
  protected isSubmitting = signal(false);
  protected errorMessage = signal<string | null>(null);
  protected successMessage = signal<string | null>(null);
  protected registerValidationErrors = signal<string[]>([]);
  private readonly router = inject(Router);

  protected loginForm = { username: '', password: '' };
  protected registerForm = { username: '', email: '', password: '' };

  protected setMode(m: 'login' | 'register') {
    this.mode.set(m);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.registerValidationErrors.set([]);
  }

  protected submitLogin() {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.http.post<AuthResponse>('/api/auth/login', this.loginForm).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.jwt) {
          this.userService.setSession(res.jwt);
          this.userService.loadCurrentUser(true);
          this.successMessage.set('Login successful!');
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        if (err.status === 401) {
          this.userService.clearSession();
          this.errorMessage.set('Invalid username, email, or password.');
          this.router.navigate(['/login']);
        } else if (err.status === 403) {
          this.userService.clearSession();
          this.toastService.show('Your account is banned. Please contact support for more information.', 'error');
          this.router.navigate(['/login']);
        } else {
          this.errorMessage.set(this.readServerMessage(err) ?? 'Unable to sign in right now.');
        }
      }
    });
  }

  protected submitRegister() {
    const clientValidationErrors = this.validateRegisterForm();
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.registerValidationErrors.set(clientValidationErrors);

    if (clientValidationErrors.length) {
      this.errorMessage.set('Please fix the registration fields and try again.');
      return;
    }

    this.isSubmitting.set(true);

    this.http.post<AuthResponse>('/api/auth/register', this.normalizedRegisterForm()).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        if (res.jwt) {
          this.userService.setSession(res.jwt);
          this.userService.loadCurrentUser(true);
          this.successMessage.set('Registration successful!');
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const serverErrors = this.readServerErrors(err);
        this.registerValidationErrors.set(serverErrors);
        this.errorMessage.set(this.readServerMessage(err) ?? 'Unable to create your account right now.');
      }
    });
  }

  private normalizedRegisterForm() {
    return {
      username: this.registerForm.username.trim(),
      email: this.registerForm.email.trim().toLowerCase(),
      password: this.registerForm.password,
    };
  }

  private validateRegisterForm(): string[] {
    const errors: string[] = [];
    const username = this.registerForm.username.trim();
    const email = this.registerForm.email.trim();
    const password = this.registerForm.password;

    if (!username) {
      errors.push('Username is required');
    } else {
      if (username.length < 3 || username.length > 15) {
        errors.push('Username must be between 3 and 15 characters');
      }

      if (!/^[A-Za-z0-9_]+$/.test(username)) {
        errors.push('Username can only contain letters, numbers, and underscores');
      }
    }

    if (!email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Enter a valid email address');
    }

    if (!password) {
      errors.push('Password is required');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    return errors;
  }

  private readServerMessage(err: { error?: ApiErrorResponse }): string | null {
    return err.error?.message?.trim() || null;
  }

  private readServerErrors(err: { error?: ApiErrorResponse }): string[] {
    return (err.error?.errors ?? []).filter(error => !!error?.trim());
  }
}
