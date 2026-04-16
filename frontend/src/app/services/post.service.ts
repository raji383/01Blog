import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PostResponse {
    id: number;
    title: string;
    content: string;
    mediaUrl?: string;
    authorId?: number;
    authorUsername?: string;
    likeCount?: number;
    commentCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface PostComment {
    id: number;
    author: string;
    avatar: string;
    text: string;
    timestamp: string;
}

export interface Post {
    id: number;
    author: string;
    avatar: string;
    role?: string;
    timestamp: string;
    content: string;
    image?: string;
    likes: number;
    comments: PostComment[];
    liked?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PostService {
    private apiUrl = 'http://localhost:8080/api/posts';

    constructor(private http: HttpClient) { }

    getFeed(): Observable<Post[]> {
        return this.http.get<PostResponse[]>(`${this.apiUrl}/feed`).pipe(
            map(responses => (responses || []).map(r => this.mapPostResponse(r)))
        );
    }

    createPost(postRequest: { title: string; content: string; mediaUrl?: string; authorUsername: string }): Observable<PostResponse> {
        return this.http.post<PostResponse>(`${this.apiUrl}`, postRequest);
    }

    uploadMedia(file: File): Observable<{ mediaUrl: string }> {
        const form = new FormData();
        form.append('file', file);
        return this.http.post<{ mediaUrl: string }>(`${this.apiUrl}/upload`, form);
    }

    getComments(postId: number): Observable<PostComment[]> {
        return this.http.get<PostComment[]>(`${this.apiUrl}/${postId}/comments`);
    }

    addComment(postId: number, text: string) {
        return this.http.post<PostComment>(`${this.apiUrl}/${postId}/comments`, { text });
    }

    toggleLike(postId: number) {
        return this.http.post(`${this.apiUrl}/${postId}/like`, {});
    }

    private mapPostResponse(r: PostResponse): Post {
        const author = r.authorUsername || 'Unknown';
        return {
            id: r.id || 0,
            author,
            avatar: (author && author.charAt ? author.charAt(0).toUpperCase() : 'U'),
            timestamp: r.createdAt ? new Date(r.createdAt).toLocaleString() : 'now',
            content: r.content || '',
            image: r.mediaUrl,
            likes: r.likeCount || 0,
            comments: [],
            liked: false,
        };
    }
}
