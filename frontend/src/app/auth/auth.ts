import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import type { AuthResponse } from '../models/user';
import { UserService } from '../Service/UserService';
import { ToastService } from '../shared/ui/toast/toast.service';

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
  private readonly router = inject(Router);

  protected loginForm = { username: '', password: '' };
  protected registerForm = { username: '', email: '', password: '' };

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
            this.userService.setSession(res.jwt);
            this.userService.loadCurrentUser(true);
            this.successMessage.set('Login successful!');
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
           if (err.status === 401) {
            this.userService.clearSession();
            this.router.navigate(['/login']);

          }else if (err.status===403) {
            this.userService.clearSession();
            this.toastService.show('Your account is banned. Please contact support for more information.', 'error');
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
            this.userService.setSession(res.jwt);
            this.userService.loadCurrentUser(true);
            this.successMessage.set('Registration successful!');
            this.router.navigate(['/']);
          }
        }
      })
    } catch (error) {

    }
  }
}
