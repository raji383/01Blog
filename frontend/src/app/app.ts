import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly http = inject(HttpClient);
  protected readonly mode = signal<'register' | 'login'>('register');
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly success = signal('');
  protected readonly authResult = signal<{
    id: number;
    username: string;
    email: string;
    role: string;
  } | null>(null);
  protected readonly form = {
    username: '',
    email: '',
    password: ''
  };
  private readonly apiUrl = 'http://localhost:8080/api/auth';

  protected setMode(mode: 'register' | 'login'): void {
    this.mode.set(mode);
    this.error.set('');
    this.success.set('');
    this.authResult.set(null);
  }

  protected async submit(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');
    this.authResult.set(null);

    const endpoint = this.mode() === 'register' ? 'register' : 'login';
    const payload =
      this.mode() === 'register'
        ? this.form
        : { email: this.form.email, password: this.form.password };

    try {
      const response = await firstValueFrom(
        this.http.post<{
          id: number;
          username: string;
          email: string;
          role: string;
        }>(`${this.apiUrl}/${endpoint}`, payload)
      );

      this.authResult.set(response);
      this.success.set(
        this.mode() === 'register'
          ? 'Account created successfully.'
          : 'Login successful.'
      );
    } catch (error: any) {
      this.error.set(error?.error?.message ?? 'Request failed.');
    } finally {
      this.loading.set(false);
    }
  }
}
