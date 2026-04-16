import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-add-post',
	standalone: true,
	imports: [CommonModule, FormsModule],
	templateUrl: './add-post.html',
	styleUrls: ['./add-post.css'],
})
export class AddPost {
	@Output() postCreated = new EventEmitter<void>();

	postContent = signal('');
	isPosting = signal(false);
	previewUrl = signal<string | null>(null);
	error = signal<string | null>(null);

	onFileSelected(_event: Event) {
		// stub: preview handling omitted
	}

	removeImage() {
		this.previewUrl.set(null);
	}

	publishPost() {
		this.isPosting.set(true);
		// minimal stub behaviour
		setTimeout(() => {
			this.isPosting.set(false);
			this.postContent.set('');
			this.postCreated.emit();
		}, 200);
	}
}
