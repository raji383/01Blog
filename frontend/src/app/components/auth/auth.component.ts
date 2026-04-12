import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>{{ isLoginMode ? 'Login' : 'Register' }}</h2>

        <form (ngSubmit)="submit()" #form="ngForm">
          <div *ngIf="!isLoginMode" class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              [(ngModel)]="formData.username"
              required
              #username="ngModel"
            />
            <div *ngIf="username.invalid && username.touched" class="error">
              Username is required
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="formData.email"
              required
              email
              #email="ngModel"
            />
            <div *ngIf="email.invalid && email.touched" class="error">
              Valid email is required
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              [(ngModel)]="formData.password"
              required
              minlength="6"
              #password="ngModel"
            />
            <div *ngIf="password.invalid && password.touched" class="error">
              Password must be at least 6 characters
            </div>
          </div>

          <button type="submit" [disabled]="loading() || form.invalid" class="submit-btn">
            {{ loading() ? 'Please wait...' : (isLoginMode ? 'Login' : 'Register') }}
          </button>
        </form>

        <div class="mode-switch">
          <button
            type="button"
            (click)="toggleMode()"
            class="mode-btn"
          >
            {{ isLoginMode ? 'Need an account? Register' : 'Already have an account? Login' }}
          </button>
        </div>

        <div *ngIf="error()" class="message error">
          {{ error() }}
        </div>

        <div *ngIf="success()" class="message success">
          {{ success() }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f5f5f5;
    }

    .auth-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: #333;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    input:focus {
      outline: none;
      border-color: #007bff;
    }

    .error {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .submit-btn {
      width: 100%;
      padding: 0.75rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      margin-bottom: 1rem;
    }

    .submit-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .mode-switch {
      text-align: center;
    }

    .mode-btn {
      background: none;
      border: none;
      color: #007bff;
      cursor: pointer;
      text-decoration: underline;
    }

    .message {
      padding: 0.75rem;
      border-radius: 4px;
      margin-top: 1rem;
      text-align: center;
    }

    .error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
  `]
})
export class AuthComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoginMode = false;
  loading = signal(false);
  error = signal('');
  success = signal('');

  formData = {
    username: '',
    email: '',
    password: ''
  };

  ngOnInit() {
    this.isLoginMode = this.route.snapshot.url[0]?.path === 'login';
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.error.set('');
    this.success.set('');
  }

  async submit() {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    try {
      if (this.isLoginMode) {
        await this.authService.login({
          email: this.formData.email,
          password: this.formData.password
        }).toPromise();
      } else {
        await this.authService.register(this.formData).toPromise();
      }

      this.router.navigate(['/feed']);
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Authentication failed');
    } finally {
      this.loading.set(false);
    }
  }
}