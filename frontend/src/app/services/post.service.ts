import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Post {
  id: number;
  title: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  updatedAt?: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  likeCount: number;
  commentCount: number;
  liked?: boolean;
}

export interface PostRequest {
  title: string;
  content: string;
  mediaUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly apiUrl = 'http://localhost:8081/api/posts';

  constructor(private http: HttpClient) {}

  getFeed(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/feed`);
  }

  getPostsByUser(username: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/user/${username}`);
  }

  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/admin`);
  }

  createPost(post: PostRequest): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, post);
  }

  updatePost(id: number, post: PostRequest): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/${id}`, post);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deletePostByAdmin(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/${id}`);
  }

  toggleLike(postId: number): Observable<{ liked: boolean; count: number }> {
    return this.http.post<{ liked: boolean; count: number }>(`${this.apiUrl}/${postId}/like`, {});
  }
}