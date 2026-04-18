import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-addpost',
  imports: [CommonModule, FormsModule],
  templateUrl: './addpost.html',
  styleUrl: './addpost.css',
})
export class Addpost {
  private readonly http = inject(HttpClient);
  @Output() postPublished = new EventEmitter<void>();

  protected postContent = signal('');
  protected previewUrl = signal<string | null>(null);
  protected error = signal<string | null>(null);
  protected isPosting = signal(false);
  private selectedFile: File | null = null;

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
    const authorUsername = 'admin'; // Replace with actual username from auth context

    if (!content) {
      this.error.set('Please write something before posting!');
      return;
    }

    this.isPosting.set(true);
    this.error.set(null);

    const formData = new FormData();
    formData.append('title', content.split('\n')[0]);
    formData.append('content', content);
    console.log(content, formData);
    formData.append('authorUsername', authorUsername);
    if (this.selectedFile) {
      formData.append('mediaFile', this.selectedFile);
    }
    this.http.post('http://localhost:8080/api/posts', formData).subscribe({
      next: () => {
        this.postContent.set('');
        this.removeImage();
        this.isPosting.set(false);
        this.postPublished.emit();
      },
      error: (err) => {
        this.error.set('Failed to publish post. Please try again.');
        this.isPosting.set(false);
        console.error('Error publishing post:', err);
      }
    });
  }
}
