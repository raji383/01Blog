import { Component } from '@angular/core';
import { Posts } from './posts/posts';

@Component({
  selector: 'app-feed',
  imports: [Posts],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed {}
