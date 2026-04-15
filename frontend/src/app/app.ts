import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly mode = signal<'login' | 'register'>('login');

  protected setMode(mode: 'login' | 'register'): void {
    this.mode.set(mode);
  }
}
