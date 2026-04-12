import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostService, Post } from '../../services/post.service';
import { CommentService, Comment, CommentRequest } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="post-detail-container">
      <div *ngIf="loading()" class="loading">
        <div style="font-size: 20px; margin-bottom: 16px;">📝</div>
        <p>Loading post...</p>
      </div>

      <div *ngIf="!loading() && post()" class="post-card">
        <div class="post-header">
          <div class="post-author">
            <div class="avatar">{{ post()!.user.username.charAt(0).toUpperCase() }}</div>
            <div class="post-user-info">
              <a [routerLink]="['/user', post()!.user.username]" class="post-username">
                {{ post()!.user.username }}
              </a>
              <span class="post-time">{{ formatDate(post()!.createdAt) }}</span>
            </div>
          </div>
        </div>

        <h2 class="post-title">{{ post()!.title }}</h2>
        <p *ngIf="post()!.content" class="post-content">{{ post()!.content }}</p>

        <div *ngIf="post()!.mediaUrl" class="media">
          <img *ngIf="isImage(post()!.mediaUrl)" [src]="post()!.mediaUrl" alt="Post media" />
          <video *ngIf="isVideo(post()!.mediaUrl)" [src]="post()!.mediaUrl" controls></video>
        </div>

        <div class="post-stats">
          <span>❤️ {{ post()!.likeCount }} likes</span>
          <span>💬 {{ comments().length }} comments</span>
        </div>

        <div class="post-actions">
          <button
            (click)="toggleLike()"
            [class.liked]="post()!.liked"
            class="post-action-btn"
          >
            <span>❤️</span>
            {{ post()!.liked ? 'Unlike' : 'Like' }}
          </button>
        </div>

        <div class="comments-section">
          <h3>Comments ({{ comments().length }})</h3>

          <div class="add-comment">
            <div class="avatar">{{ currentUserInitial() }}</div>
            <textarea
              [(ngModel)]="newComment"
              placeholder="Write a comment..."
              class="comment-input"
            ></textarea>
            <button
              (click)="submitComment()"
              [disabled]="!newComment.trim()"
              class="submit-btn"
            >
              Post
            </button>
          </div>

          <div class="comments-list">
            <div *ngFor="let comment of comments()" class="comment">
              <div class="avatar">{{ comment.user.username.charAt(0).toUpperCase() }}</div>
              <div class="comment-content">
                <a [routerLink]="['/user', comment.user.username]" class="comment-username">
                  {{ comment.user.username }}
                </a>
                <p class="comment-text">{{ comment.content }}</p>
                <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
                <button
                  *ngIf="isCommentOwner(comment)"
                  (click)="deleteComment(comment.id)"
                  class="delete-comment-btn"
                >
                  Delete
                </button>
              </div>
            </div>

            <div *ngIf="comments().length === 0" class="no-comments">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!loading() && !post()" class="error-message">
        <div style="font-size: 48px; margin-bottom: 16px;">😕</div>
        <p>Post not found or you don't have access to it.</p>
        <a routerLink="/" class="back-link">← Back to feed</a>
      </div>
    </div>
  `,
  styles: []
})
export class PostDetailComponent implements OnInit {
  private postService = inject(PostService);
  private commentService = inject(CommentService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  post = signal<Post | null>(null);
  comments = signal<Comment[]>([]);
  loading = signal(true);
  newComment = '';

  ngOnInit() {
    this.route.params.subscribe(params => {
      const postId = params['id'];
      this.loadPost(postId);
      this.loadComments(postId);
    });
  }

  loadPost(id: string) {
    this.loading.set(true);
    this.postService.getFeed().subscribe({
      next: (posts: Post[]) => {
        const foundPost = posts.find(p => p.id === Number(id));
        if (foundPost) {
          this.post.set(foundPost);
        }
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error loading post:', err);
        this.loading.set(false);
      }
    });
  }

  loadComments(postId: string) {
    this.commentService.getComments(Number(postId)).subscribe({
      next: (comments: Comment[]) => {
        this.comments.set(comments);
      },
      error: (err: any) => console.error('Error loading comments:', err)
    });
  }

  submitComment() {
    if (!this.newComment.trim() || !this.post()) return;

    const commentRequest = { content: this.newComment };
    this.commentService.addComment(this.post()!.id, commentRequest).subscribe({
      next: (comment: Comment) => {
        this.comments.update(c => [...c, comment]);
        this.newComment = '';
      },
      error: (err: any) => console.error('Error adding comment:', err)
    });
  }

  deleteComment(commentId: number) {
    if (!confirm('Delete this comment?')) return;

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments.update(c => c.filter(cm => cm.id !== commentId));
      },
      error: (err: any) => console.error('Error deleting comment:', err)
    });
  }

  toggleLike() {
    if (!this.post()) return;

    this.postService.toggleLike(this.post()!.id).subscribe({
      next: (result: { liked: boolean; count: number }) => {
        if (this.post()) {
          this.post()!.liked = result.liked;
          this.post()!.likeCount = result.count;
        }
      },
      error: (err: any) => console.error('Error toggling like:', err)
    });
  }

  isCommentOwner(comment: Comment): boolean {
    return this.authService.getCurrentUser()?.id === comment.user.id;
  }

  currentUserInitial(): string {
    const user = this.authService.getCurrentUser();
    return user?.username.charAt(0).toUpperCase() || '?';
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