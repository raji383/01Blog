import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import type { PostResponse } from '../../../models/user';

@Component({
  selector: 'app-posts',
  imports: [],
  templateUrl: './posts.html',
  styleUrl: './posts.css',
})
export class Posts {
  private readonly http = inject(HttpClient);
  private getposts : PostResponse[] = [];

  ngOnInit() {
    try {
      this.http.get<PostResponse[]>('http://localhost:8080/api/posts/feed').subscribe({
        next: (res) => {
          console.log(res);
          if (res) {
            console.log(res);
            this.getposts = res;

          }
        }
      })
    } catch (error) {

    }
  }
}
