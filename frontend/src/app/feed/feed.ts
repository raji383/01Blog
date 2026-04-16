import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from '../services/post.service';
import { Post } from '../models/post';
import { AddPost } from './add-post/add-post';
import { PostComponent } from './post/post';

@Component({
	selector: 'app-feed',
	standalone: true,
	imports: [CommonModule, AddPost, PostComponent],
	templateUrl: './feed.html',
	styleUrls: ['./feed.css'],
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

		this.postService.getPosts().subscribe({
			next: posts => {
				this.posts = posts;
				this.isLoading = false;
			},
			error: err => {
				console.error(err);
				this.error = 'Failed to load posts';
				this.isLoading = false;
			}
		});
	}

	protected onPostCreated(): void {
		this.loadPosts();
	}
}
