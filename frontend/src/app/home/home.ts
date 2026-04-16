import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { CommonModule } from '@angular/common';
import { FeedComponent } from '../feed/feed';

@Component({
    selector: 'app-home',
    imports: [Navbar, CommonModule,FeedComponent],
    templateUrl: './home.html',
    styleUrl: './home.css',
})
export class Home implements OnInit {
    private readonly router = inject(Router);
    users: any[] = [];
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