import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="create-post-page">
      <div class="create-post-card">
        <h2>📝 Create New Post</h2>

        <form (ngSubmit)="submit()" #form="ngForm">
          <div class="form-group">
            <label for="title">Post Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              [(ngModel)]="postData.title"
              placeholder="What's on your mind?"
              required
              #title="ngModel"
            />
            <div *ngIf="title.invalid && title.touched" class="error-message">
              Title is required
            </div>
          </div>

          <div class="form-group">
            <label for="content">Content</label>
            <textarea
              id="content"
              name="content"
              [(ngModel)]="postData.content"
              rows="6"
              placeholder="Share your thoughts, ideas, or learning journey..."
              class="content-input"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="mediaUrl">Media URL (optional)</label>
            <input
              type="url"
              id="mediaUrl"
              name="mediaUrl"
              [(ngModel)]="postData.mediaUrl"
              placeholder="https://example.com/image.jpg"
            />
            <small>💡 Enter a URL to an image (.jpg, .png, etc.) or video (.mp4, .webm, etc.)</small>
          </div>

          <div class="form-actions">
            <button type="button" (click)="cancel()" class="cancel-btn">
              Cancel
            </button>
            <button type="submit" [disabled]="loading() || form.invalid" class="submit-btn">
              {{ loading() ? '⏳ Creating...' : '✓ Create Post' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class CreatePostComponent {
  private postService = inject(PostService);
  private router = inject(Router);

  postData = {
    title: '',
    content: '',
    mediaUrl: ''
  };

  loading = signal(false);

  submit() {
    this.loading.set(true);
    this.postService.createPost(this.postData).subscribe({
      next: () => {
        this.router.navigate(['/profile']);
      },
      error: (err: any) => {
        console.error('Error creating post:', err);
        this.loading.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/profile']);
  }
}