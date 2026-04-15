import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { FeedComponent } from '../feed/feed';

@Component({
  selector: 'app-home',
  imports: [Navbar, FeedComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly router = inject(Router);

  ngOnInit() {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('auth_token') : null;

    if (!token) {
      try {
        this.router.navigate(['/login']);
      } catch {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      return;
    }

    console.log('JWT exists:', token);
  }
}