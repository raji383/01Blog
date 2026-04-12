import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostService, Post } from '../../services/post.service';
import { UserService, UserProfile } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="profile-container">
      <div *ngIf="profile()" class="profile-header">
        <h1>{{ profile()?.username }}</h1>
        <p>{{ profile()?.subscriberCount }} subscribers</p>
        <button
          *ngIf="!isOwnProfile()"
          (click)="toggleSubscription()"
          [disabled]="subLoading()"
          class="subscribe-btn"
        >
          {{ isSubscribed() ? 'Unsubscribe' : 'Subscribe' }}
        </button>
      </div>

      <div *ngIf="loading()" class="loading">Loading posts...</div>

      <div class="posts-list">
        <div *ngFor="let post of posts()" class="post-card">
          <h3>{{ post.title }}</h3>
          <p *ngIf="post.content" class="content">{{ post.content }}</p>

          <div *ngIf="post.mediaUrl" class="media">
            <img *ngIf="isImage(post.mediaUrl)" [src]="post.mediaUrl" alt="Post media" />
            <video *ngIf="isVideo(post.mediaUrl)" [src]="post.mediaUrl" controls></video>
          </div>

          <div class="post-actions">
            <button (click)="toggleLike(post)" class="like-btn">
              ❤️ {{ post.likeCount }}
            </button>
            <a [routerLink]="['/post', post.id]" class="comment-link">
              💬 {{ post.commentCount }}
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container { max-width: 800px; margin: 0 auto; padding: 2rem; }
    .profile-header { text-align: center; margin-bottom: 2rem; }
    .subscribe-btn { padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .loading { text-align: center; padding: 2rem; }
    .posts-list { display: flex; flex-direction: column; gap: 1.5rem; }
    .post-card { background: white; border: 1px solid #e1e5e9; border-radius: 8px; padding: 1.5rem; }
    .content { margin: 1rem 0; }
    .media img, .media video { max-width: 100%; border-radius: 4px; }
    .post-actions { display: flex; gap: 1rem; margin-top: 1rem; }
    .like-btn { background: none; border: 1px solid #ddd; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
    .comment-link { color: #666; text-decoration: none; padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 4px; }
  `]
})
export class UserProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private postService = inject(PostService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  profile = signal<UserProfile | null>(null);
  posts = signal<Post[]>([]);
  loading = signal(true);
  subLoading = signal(false);
  isSubscribed = signal(false);

  ngOnInit() {
    const username = this.route.snapshot.params['username'];
    this.loadProfile(username);
    this.loadPosts(username);
    this.checkSubscription();
  }

  loadProfile(username: string) {
    this.userService.getProfile(username).subscribe({
      next: (profile) => this.profile.set(profile),
      error: (err) => console.error('Error loading profile:', err)
    });
  }

  loadPosts(username: string) {
    this.postService.getPostsByUser(username).subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading posts:', err);
        this.loading.set(false);
      }
    });
  }

  checkSubscription() {
    this.userService.getSubscriptions().subscribe({
      next: (subs) => {
        const username = this.route.snapshot.params['username'];
        this.isSubscribed.set(subs.some(sub => sub.username === username));
      }
    });
  }

  toggleSubscription() {
    const username = this.route.snapshot.params['username'];
    this.subLoading.set(true);
    this.userService.getProfile(username).subscribe({
      next: (profile) => {
        this.userService.toggleSubscription(profile.id).subscribe({
          next: (result) => {
            this.isSubscribed.set(result.subscribed);
            this.subLoading.set(false);
          },
          error: (err) => {
            console.error('Error toggling subscription:', err);
            this.subLoading.set(false);
          }
        });
      }
    });
  }

  toggleLike(post: Post) {
    this.postService.toggleLike(post.id).subscribe({
      next: (result) => {
        post.liked = result.liked;
        post.likeCount = result.count;
      },
      error: (err) => console.error('Error toggling like:', err)
    });
  }

  isOwnProfile(): boolean {
    const currentUser = this.authService.getCurrentUser();
    const profileUsername = this.route.snapshot.params['username'];
    return currentUser?.username === profileUsername;
  }

  isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  }

  isVideo(url: string): boolean {
    return /\.(mp4|webm|ogg)$/i.test(url);
  }
}