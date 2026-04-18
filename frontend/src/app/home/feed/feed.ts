import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Posts } from './posts/posts';
import type { PostResponse } from '../../models/user';
import { Addpost } from './addpost/addpost';

@Component({
  selector: 'app-feed',
  imports: [Posts, Addpost, CommonModule],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed {
  private readonly http = inject(HttpClient);
  protected posts = signal<PostResponse[]>([]);

  ngOnInit() {
    try {
      this.http.get<PostResponse[]>('http://localhost:8080/api/posts/feed').subscribe({
        next: (res) => {
          if (res) {
            console.log(res);
            this.posts.set(res);
          }
        },
        error: (err) => console.error('Error fetching posts:', err)
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }
  protected addPost(newPost: PostResponse) {
    try {
      this.http.post<PostResponse>('http://localhost:8080/api/posts', newPost).subscribe({
        next: (res) => {
          console.log(res);
          this.posts.update(posts => [newPost, ...posts]);
        }
      });
    } catch (error) {
      console.error('Error adding post:', error);
    }
  }
}


