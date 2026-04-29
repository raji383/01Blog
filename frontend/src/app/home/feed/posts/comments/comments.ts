import { HttpClient } from '@angular/common/http';
import { Component, inject, Input, signal } from '@angular/core';
import { UserService } from '../../../../Service/UserService';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-comments',
  imports: [FormsModule],
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
            console.log(res);
            this.comments.set(res);
          },
          error: (err) => {
            console.error('Error submitting comment:', err);
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
          console.log(res);
          this.commentContent = ''; 
          this.getComments(); 

        },
        error: (err) => {
          console.error('Error submitting comment:', err);
        }
      });

    } catch (error) {

    }
  }
  ngOnInit() {
    this.getComments();
  }
}
