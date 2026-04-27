import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import type { PostResponse } from '../../../../models/user';
import { NgIf } from '@angular/common';
import { UserService } from '../../../../Service/UserService';

@Component({
  selector: 'app-show-options',
  imports: [NgIf],
  templateUrl: './show-options.html',
  styleUrl: './show-options.css',
})
export class ShowOptions {
  @Input({ required: true }) post!: PostResponse;
  @Output() closeMenu = new EventEmitter<void>();
  @Output() edit = new EventEmitter<PostResponse>();
  @Output() delete = new EventEmitter<number>();
  @Output() report = new EventEmitter<number>();
  private readonly userService = inject(UserService);


  protected onEdit(): void {
    this.edit.emit(this.post);
    this.closeMenu.emit();
  }

  protected onDelete(): void {
    this.delete.emit(this.post.id);
    this.closeMenu.emit();
  }
  protected onReport(): void {
    this.report.emit(this.post.id);
    this.closeMenu.emit();
  }

  protected onClose(): void {
    this.closeMenu.emit();
  }

  protected  MYpost(ev: string): boolean {
    const currentUser = this.userService.getUser()();

    return (currentUser?.username === this.post.authorUsername || (currentUser?.role === 'ADMIN' && ev === 'Delete'));
  }
}
