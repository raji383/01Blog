import { Component, OnInit } from '@angular/core';
import { PostComponent } from './post/post';
import { AddPostComponent } from './add-post/add-post';
import { NgFor, NgIf } from '@angular/common';
import { PostService, Post } from '../services/post.service';

@Component({
  selector: 'app-feed',
  imports: [PostComponent, AddPostComponent, NgFor, NgIf],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class FeedComponent implements OnInit {
  protected posts: Post[] = [];
  protected isLoading = true;
  protected error: string | null = null;

  constructor(private postService: PostService) { }

  ngOnInit(): void {
    this.loadPosts();
  }

  private loadPosts(): void {
    this.isLoading = true;
    this.error = null;

    this.postService.getFeed().subscribe({
      next: posts => {
        this.posts = posts;
        // defer to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => { this.isLoading = false; });
      },
      error: err => {
        console.error('Failed to fetch feed', err);
        this.error = 'Failed to load posts. Please try again later.';
        setTimeout(() => { this.isLoading = false; });
      }
    });
  }

  protected onPostCreated(): void {
    // refresh feed (currently uses static sample data)
    this.loadPosts();
  }
}
