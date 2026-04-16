import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css'],
})
export class Auth {
  protected mode = signal<'login' | 'register'>('login');
  protected isSubmitting = signal(false);
  protected errorMessage = signal<string | null>(null);
  protected successMessage = signal<string | null>(null);

  protected loginForm = { username: '', password: '' };
  protected registerForm = { username: '', email: '', password: '' };

  protected setMode(m: 'login' | 'register') {
    this.mode.set(m);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  protected submitLogin() {
   
  }

  protected submitRegister() {
    
  }
}
