import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../../../Service/UserService';
import { PostResponse } from '../../../models/user';

@Component({
  selector: 'app-addpost',
  imports: [CommonModule, FormsModule],
  templateUrl: './addpost.html',
  styleUrl: './addpost.css',
})
export class Addpost {
  private readonly http = inject(HttpClient);
  @Output() postPublished = new EventEmitter<PostResponse>();
  protected postContent = signal('');
  protected previewUrl = signal<string | null>(null);
  protected error = signal<string | null>(null);
  protected isPosting = signal(false);
  private selectedFile: File | null = null;
  private readonly router = inject(Router);
  private userService = inject(UserService);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.previewUrl.set(null);
    this.selectedFile = null;
  }

  publishPost(): void {
    const content = this.postContent().trim();
    const user = this.userService.getUser()();
    const authorUsername = user?.username || 'admin';
    const token = typeof window !== 'undefined'
      ? window.localStorage.getItem('auth_token')
      : null;

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    if (!content) {
      this.error.set('Please write something before posting!');
      return;
    }

    this.isPosting.set(true);
    this.error.set(null);

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const formData = new FormData();
    formData.append('title', content.split('\n')[0]);
    formData.append('content', content);
    formData.append('authorUsername', authorUsername);
    
    if (this.selectedFile) {
      console.log('dgf'+this.selectedFile);
      formData.append('mediaFile', this.selectedFile);
    }

    this.http.post('http://localhost:8080/api/posts', formData, { headers })
      .subscribe({
        next: (res: any) => {
          this.postContent.set('');
          this.removeImage();
          this.isPosting.set(false);
          this.postPublished.emit(res);
        },
        error: (err) => {
          this.error.set('Failed to publish post. Please try again.');
          this.isPosting.set(false);
          console.error(err);
        }
      });
  }
}
