import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RegisterPayload } from '../../models/user';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  protected readonly http = inject(HttpClient);
  ngOnInit(){
    try {
       this.http.get<RegisterPayload>('http://localhost:8080/api/users/me')
    } catch (error) {
      
    }
  }
}
