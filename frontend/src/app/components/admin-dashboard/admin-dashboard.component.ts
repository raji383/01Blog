import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService, Post } from '../../services/post.service';
import { UserService, UserProfile } from '../../services/user.service';
import { ReportService, Report } from '../../services/report.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-container">
      <h1>Admin Dashboard</h1>

      <div class="tabs">
        <button
          [class.active]="activeTab() === 'users'"
          (click)="activeTab.set('users')"
        >
          Users
        </button>
        <button
          [class.active]="activeTab() === 'posts'"
          (click)="activeTab.set('posts')"
        >
          Posts
        </button>
        <button
          [class.active]="activeTab() === 'reports'"
          (click)="activeTab.set('reports')"
        >
          Reports
        </button>
      </div>

      <div *ngIf="activeTab() === 'users'" class="section">
        <h2>All Users</h2>
        <div *ngIf="usersLoading()" class="loading">Loading users...</div>
        <div class="items-list">
          <div *ngFor="let user of users()" class="item-card">
            <div class="item-info">
              <strong>{{ user.username }}</strong> ({{ user.email }})
              <br>
              <small>Role: {{ user.role }} | Subscribers: {{ user.subscriberCount }}</small>
            </div>
            <button (click)="deleteUser(user.id)" class="delete-btn">Delete User</button>
          </div>
        </div>
      </div>

      <div *ngIf="activeTab() === 'posts'" class="section">
        <h2>All Posts</h2>
        <div *ngIf="postsLoading()" class="loading">Loading posts...</div>
        <div class="items-list">
          <div *ngFor="let post of posts()" class="item-card">
            <div class="item-info">
              <strong>{{ post.title }}</strong> by {{ post.user.username }}
              <br>
              <small>Likes: {{ post.likeCount }} | Comments: {{ post.commentCount }}</small>
            </div>
            <button (click)="deletePost(post.id)" class="delete-btn">Delete Post</button>
          </div>
        </div>
      </div>

      <div *ngIf="activeTab() === 'reports'" class="section">
        <h2>Reports</h2>
        <div *ngIf="reportsLoading()" class="loading">Loading reports...</div>
        <div class="items-list">
          <div *ngFor="let report of reports()" class="item-card">
            <div class="item-info">
              <strong>{{ report.reporter.username }}</strong> reported <strong>{{ report.reportedUser.username }}</strong>
              <br>
              <small>{{ report.reason }}</small>
              <br>
              <small>{{ formatDate(report.createdAt) }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container { max-width: 1000px; margin: 0 auto; padding: 2rem; }
    h1 { text-align: center; margin-bottom: 2rem; }
    .tabs { display: flex; gap: 1rem; margin-bottom: 2rem; }
    .tabs button { padding: 0.75rem 1.5rem; background: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; }
    .tabs button.active { background: #007bff; color: white; border-color: #007bff; }
    .section { background: white; border: 1px solid #e1e5e9; border-radius: 8px; padding: 1.5rem; }
    .loading { text-align: center; padding: 2rem; }
    .items-list { display: flex; flex-direction: column; gap: 1rem; }
    .item-card { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #eee; border-radius: 4px; }
    .item-info { flex: 1; }
    .delete-btn { background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private userService = inject(UserService);
  private postService = inject(PostService);
  private reportService = inject(ReportService);

  activeTab = signal<'users' | 'posts' | 'reports'>('users');
  users = signal<UserProfile[]>([]);
  posts = signal<Post[]>([]);
  reports = signal<Report[]>([]);
  usersLoading = signal(true);
  postsLoading = signal(false);
  reportsLoading = signal(false);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.usersLoading.set(true);
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.usersLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.usersLoading.set(false);
      }
    });
  }

  loadPosts() {
    this.postsLoading.set(true);
    this.postService.getAllPosts().subscribe({
      next: (posts) => {
        this.posts.set(posts);
        this.postsLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading posts:', err);
        this.postsLoading.set(false);
      }
    });
  }

  loadReports() {
    this.reportsLoading.set(true);
    this.reportService.getAllReports().subscribe({
      next: (reports) => {
        this.reports.set(reports);
        this.reportsLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading reports:', err);
        this.reportsLoading.set(false);
      }
    });
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Error deleting user:', err)
      });
    }
  }

  deletePost(id: number) {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePostByAdmin(id).subscribe({
        next: () => this.loadPosts(),
        error: (err) => console.error('Error deleting post:', err)
      });
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }
}