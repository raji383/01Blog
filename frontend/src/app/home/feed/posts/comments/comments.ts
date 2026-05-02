import { HttpClient } from '@angular/common/http';
import { Component, inject, Input, signal } from '@angular/core';
import { UserService } from '../../../../Service/UserService';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-comments',
  imports: [FormsModule,NgIf],
  standalone: true,
  templateUrl: './comments.html',
  styleUrl: './comments.css',
})
export class Comments {
  private readonly http = inject(HttpClient);
  @Input() post: any;
  protected comments = signal<any[]>([]);
  protected commentContent: string = '';
  userService = inject(UserService);
  currentUser: any = this.userService.getUser()();
  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
  getComments() {
    try {

      try {
        this.http.get<any[]>(`/api/posts/${this.post.id}/comments`).subscribe({
          next: (res) => {
            this.comments.set(res);
          },
          error: (err) => {
          }
        });

      } catch (error) {

      }
    } catch (error) {

    }
  }
  submitComment() {
    try {
      this.http.post(`/api/posts/${this.post.id}/comments`, { content: this.commentContent }).subscribe({
        next: (res) => {
          // Handle successful comment submission
          this.commentContent = ''; 
          this.getComments(); 

        },
        error: (err) => {
        }
      });

    } catch (error) {

    }
  }
  ngOnInit() {
    this.getComments();
  }
  deleteComment(commentId: number) {
    try {
      this.http.delete(`/api/posts/comments/${commentId}`).subscribe({
        next: (res) => {
          this.getComments(); 
        },
        error: (err) => {
        }
      });

    } catch (error) {

    }
  }
}
