import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { Feed } from './feed/feed';
import { Rightbar } from './rightbar/rightbar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Navbar, Feed,Rightbar],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
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
