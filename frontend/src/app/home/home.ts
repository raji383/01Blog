import { Component, inject } from '@angular/core';
import { Router } from 'express';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private readonly router = inject(Router);

  ngOnInit() {
    const token = typeof window !== 'undefined'
      ? window.localStorage.getItem('auth_token')
      : null;

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }



  }
}
