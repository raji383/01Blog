import { Component, Input, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface PostComment {
  id: number;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
}

export interface Post {
  id: number;
  author: string;
  avatar: string;
  role?: string;
  timestamp: string;
  content: string;
  image?: string;
  likes: number;
  comments: PostComment[];
  liked?: boolean;
}

@Component({
  selector: 'app-post',
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './post.html',
  styleUrl: './post.css',
})
export class PostComponent {
  @Input() post: Post = {
    id: 1,
    author: 'John Doe',
    avatar: 'J',
    role: 'Product Manager',
    timestamp: '2 hours ago',
    content: 'Just launched a new feature! Excited to share this with everyone.',
    likes: 342,
    comments: [],
    liked: false,
  };

  protected liked = signal(this.post.liked || false);
  protected likes = signal(this.post.likes);
  protected showComments = signal(false);
  protected newComment = signal('');

  protected toggleLike(): void {
    this.liked.set(!this.liked());
    this.likes.set(this.liked() ? this.likes() + 1 : Math.max(0, this.likes() - 1));
  }

  protected toggleComments(): void {
    this.showComments.set(!this.showComments());
  }

  protected addComment(): void {
    if (!this.newComment().trim()) return;

    const comment: PostComment = {
      id: (this.post.comments?.length || 0) + 1,
      author: 'You',
      avatar: 'Y',
      text: this.newComment(),
      timestamp: 'now',
    };

    this.post.comments = [...(this.post.comments || []), comment];
    this.newComment.set('');
  }
}
