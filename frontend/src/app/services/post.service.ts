import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from '../models/post';

@Injectable({
    providedIn: 'root'
})
export class PostService {

    constructor(private http: HttpClient) {}

    getPosts(): Observable<Post[]> {
        const token = localStorage.getItem('auth_token');

        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        return this.http.get<Post[]>('http://localhost:8080/api/posts/feed', { headers });
    }
}