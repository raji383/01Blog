import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found-component/not-found-component';
import { Home } from './home/home';
import { Auth } from './auth/auth';
import { Profile } from './profile/profile';
import { Dashboard } from './dashboard/dashboard';
import { AdminUsers } from './dashboard/admin-users/admin-users';
import { AdminPosts } from './dashboard/admin-posts/admin-posts';
import { AdminReports } from './dashboard/admin-reports/admin-reports';
import { adminChildGuard, adminGuard, authGuard, guestGuard } from './auth/auth.guards';

export const routes: Routes = [
    { path: '', component: Home, canActivate: [authGuard] },
    { path:'login', component:Auth, canActivate: [guestGuard] },
    { path:'profile/:id', component:Profile, canActivate: [authGuard] },
    {
        path:'admin',
        component:Dashboard,
        canActivate: [adminGuard],
        canActivateChild: [adminChildGuard],
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'users' },
            { path: 'users', component: AdminUsers },
            { path: 'posts', component: AdminPosts },
            { path: 'reports', component: AdminReports },
        ]
    },
    { path: '**', component: NotFoundComponent }

];
