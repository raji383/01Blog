import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../models/post';


@Component({
    selector: 'app-post',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './post.html',
    styleUrl: './post.css',
})
export class PostComponent {
    @Input() post!: Post;
}