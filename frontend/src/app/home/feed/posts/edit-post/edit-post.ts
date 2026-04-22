import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { PostResponse } from '../../../../models/user';

@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-post.html',
  styleUrl: './edit-post.css',
})
export class EditPost {
  @Input({ required: true }) post!: PostResponse;
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ title: string; content: string; mediaUrl: string; mediaFile: File | null }>();

  protected readonly title = signal('');
  protected readonly content = signal('');
  protected readonly mediaUrl = signal('');
  protected readonly selectedFileName = signal<string | null>(null);
  private selectedFile: File | null = null;

  ngOnChanges(): void {
    if (!this.post) {
      return;
    }

    this.title.set(this.post.title);
    this.content.set(this.post.content);
    this.mediaUrl.set(this.post.mediaUrl ?? '');
    this.selectedFile = null;
    this.selectedFileName.set(null);
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedFile = file;
    this.selectedFileName.set(file?.name ?? null);
  }

  protected clearSelectedFile(): void {
    this.selectedFile = null;
    this.selectedFileName.set(null);
  }

  protected close(): void {
    this.cancel.emit();
  }

  protected submit(): void {
    this.save.emit({
      title: this.title().trim(),
      content: this.content().trim(),
      mediaUrl: this.mediaUrl().trim(),
      mediaFile: this.selectedFile,
    });
  }
}
