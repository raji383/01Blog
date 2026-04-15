import { Component, OnInit } from '@angular/core';
import { PostComponent, Post } from './post/post';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-feed',
  imports: [PostComponent, NgFor],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class FeedComponent implements OnInit {
  protected posts: Post[] = [];

  ngOnInit(): void {
    this.loadPosts();
  }

  private loadPosts(): void {
    this.posts = [
      {
        id: 1,
        author: 'Sarah Johnson',
        avatar: 'S',
        role: 'Product Manager at TechCorp',
        timestamp: '2 hours ago',
        content:
          'Excited to announce that our team just shipped a major feature that will transform how users interact with our platform. Can\'t wait to see the impact!',
        image:
          'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
        likes: 342,
        comments: [],
        liked: false,
      },
      {
        id: 2,
        author: 'Mike Chen',
        avatar: 'M',
        role: 'Senior Developer at WebStudio',
        timestamp: '4 hours ago',
        content:
          'Just learned a new TypeScript pattern that really improved our code quality. Here\'s what I discovered...',
        likes: 156,
        comments: [
          {
            id: 1,
            author: 'Alex Rivera',
            avatar: 'A',
            text: 'This is really interesting! Can you share more details?',
            timestamp: '1 hour ago',
          },
        ],
        liked: true,
      },
      {
        id: 3,
        author: 'Emily Zhang',
        avatar: 'E',
        role: 'UX Designer',
        timestamp: '6 hours ago',
        content:
          'Design thinking workshop was amazing today. Here are the key takeaways from our session on user empathy.',
        likes: 289,
        comments: [],
        liked: false,
      },
    ];
  }
}
