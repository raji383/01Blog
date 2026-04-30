import { Component, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { Feed } from './feed/feed';
import { Rightbar } from './rightbar/rightbar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Navbar, Feed, Rightbar],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const token = window.localStorage.getItem('auth_token');
    if (!token) this.router.navigate(['/login']);
  }
}
