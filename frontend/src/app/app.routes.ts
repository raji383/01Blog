import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/feed', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/auth/auth.component').then(m => m.AuthComponent) },
  { path: 'register', loadComponent: () => import('./components/auth/auth.component').then(m => m.AuthComponent) },
  { path: 'feed', loadComponent: () => import('./components/feed/feed.component').then(m => m.FeedComponent), canActivate: [AuthGuard] },
  { path: 'profile', loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent), canActivate: [AuthGuard] },
  { path: 'user/:username', loadComponent: () => import('./components/user-profile/user-profile.component').then(m => m.UserProfileComponent), canActivate: [AuthGuard] },
  { path: 'post/:id', loadComponent: () => import('./components/post-detail/post-detail.component').then(m => m.PostDetailComponent), canActivate: [AuthGuard] },
  { path: 'create-post', loadComponent: () => import('./components/create-post/create-post.component').then(m => m.CreatePostComponent), canActivate: [AuthGuard] },
  { path: 'admin', loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent), canActivate: [AdminGuard] },
  { path: '**', redirectTo: '/feed' }
];
