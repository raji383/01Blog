import { Component, Output, EventEmitter, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-add-post',
    imports: [NgIf, FormsModule],
    templateUrl: './add-post.html',
    styleUrl: './add-post.css',
})
export class AddPostComponent {
    @Output() postCreated = new EventEmitter<void>();

    protected postContent = signal('');
    protected selectedFile: File | null = null;
    protected previewUrl = signal<string | null>(null);
    protected isPosting = signal(false);
    protected error = signal<string | null>(null);

    constructor(private postService: PostService, private auth: AuthService) { }

    protected onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] || null;
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            this.error.set('Please select an image file');
            return;
        }
        this.selectedFile = file;
        this.error.set(null);
        const reader = new FileReader();
        reader.onload = (e) => this.previewUrl.set(e.target?.result as string);
        reader.readAsDataURL(file);
    }

    protected removeImage(): void {
        this.selectedFile = null;
        this.previewUrl.set(null);
    }

    protected async publishPost(): Promise<void> {
        const content = this.postContent().trim();
        if (!content) { this.error.set('Please write something before posting'); return; }

        this.isPosting.set(true);
        this.error.set(null);

        try {
            let mediaUrl = '';
            if (this.selectedFile) {
                try {
                    const up = await this.postService.uploadMedia(this.selectedFile).toPromise();
                    mediaUrl = up?.mediaUrl || '';
                } catch (e) {
                    console.error('upload failed', e);
                    // continue without image
                }
            }

            const postReq = {
                title: content.substring(0, 150),
                content,
                mediaUrl,
                authorUsername: this.auth.getCurrentUsername(),
            };

            await this.postService.createPost(postReq).toPromise();

            this.postContent.set('');
            this.selectedFile = null;
            this.previewUrl.set(null);

            this.postCreated.emit();
        } catch (err) {
            console.error('Failed to publish:', err);
            this.error.set('Failed to publish post. See console for details.');
        } finally {
            this.isPosting.set(false);
        }
    }
}
