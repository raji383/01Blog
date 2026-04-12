import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService, Post } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h1>👤 My Profile</h1>
        <p class="username">{{ currentUsername }}</p>
      </div>

      <div class="profile-actions">
        <a routerLink="/create-post" class="create-post-btn">✍️ Create Post</a>
      </div>

      <div *ngIf="loading()" class="loading">
        <div style="font-size: 20px; margin-bottom: 16px;">📝</div>
        <p>Loading your posts...</p>
      </div>

      <div *ngIf="!loading() && posts().length === 0" class="empty-state">
        <div style="font-size: 48px; margin-bottom: 16px;">🎓</div>
        <p>You haven't created any posts yet.</p>
        <a routerLink="/create-post" class="create-btn">Create Your First Post</a>
      </div>

      <div class="posts-list" *ngIf="!loading()">
        <div *ngFor="let post of posts()" class="post-card">
          <div class="post-header">
            <div class="post-author">
              <div class="avatar">{{ post.user.username.charAt(0).toUpperCase() }}</div>
              <div class="post-user-info">
                <span class="post-username">{{ post.user.username }}</span>
                <span class="post-time">{{ formatDate(post.createdAt) }}</span>
              </div>
            </div>
          </div>

          <h3 class="post-title">{{ post.title }}</h3>
          <p *ngIf="post.content" class="post-content">{{ post.content }}</p>

          <div *ngIf="post.mediaUrl" class="media">
            <img *ngIf="isImage(post.mediaUrl)" [src]="post.mediaUrl" alt="Post media" />
            <video *ngIf="isVideo(post.mediaUrl)" [src]="post.mediaUrl" controls></video>
          </div>

          <div class="post-stats">
            <span>❤️ {{ post.likeCount }} likes</span>
            <span>💬 {{ post.commentCount }} comments</span>
          </div>

          <div class="post-actions">
            <button (click)="deletePost(post.id)" class="delete-btn">
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProfileComponent implements OnInit {
  private postService = inject(PostService);
  private authService = inject(AuthService);

  posts = signal<Post[]>([]);
  loading = signal(true);
  currentUsername = '';

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUsername = user.username;
    }
    this.loadPosts();
  }

  loadPosts() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.postService.getPostsByUser(user.username).subscribe({
        next: (posts: Post[]) => {
          this.posts.set(posts);
          this.loading.set(false);
        },
        error: (err: any) => {
          console.error('Error loading posts:', err);
          this.loading.set(false);
        }
      });
    }
  }

  deletePost(id: number) {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(id).subscribe({
        next: () => this.loadPosts(),
        error: (err: any) => console.error('Error deleting post:', err)
      });
    }
  }

  isImage(url: string | undefined): boolean {
    return url ? /\.(jpg|jpeg|png|gif|webp)$/i.test(url) : false;
  }

  isVideo(url: string | undefined): boolean {
    return url ? /\.(mp4|webm|ogg)$/i.test(url) : false;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    const timeDiff = today.getTime() - date.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return 'Yesterday';
    if (daysDiff < 7) return `${daysDiff} days ago`;
    
    return date.toLocaleDateString();
  }
}