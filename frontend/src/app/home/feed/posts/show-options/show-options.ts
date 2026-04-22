import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { PostResponse } from '../../../../models/user';

@Component({
  selector: 'app-show-options',
  imports: [],
  templateUrl: './show-options.html',
  styleUrl: './show-options.css',
})
export class ShowOptions {
  @Input({ required: true }) post!: PostResponse;
  @Output() closeMenu = new EventEmitter<void>();
  @Output() edit = new EventEmitter<PostResponse>();
  @Output() delete = new EventEmitter<number>();

  protected onEdit(): void {
    this.edit.emit(this.post);
    this.closeMenu.emit();
  }

  protected onDelete(): void {
    this.delete.emit(this.post.id);
    this.closeMenu.emit();
  }

  protected onClose(): void {
    this.closeMenu.emit();
  }
}
