import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found-component/not-found-component';
import { Home } from './home/home';
import { Auth } from './auth/auth';
import { Profile } from './profile/profile';
import { Dashboard } from './dashboard/dashboard';
import { AdminUsers } from './dashboard/admin-users/admin-users';
import { AdminPosts } from './dashboard/admin-posts/admin-posts';
import { AdminReports } from './dashboard/admin-reports/admin-reports';

export const routes: Routes = [
    { path: '', component: Home },
    {path:'login',component:Auth},
    {path:'profile/:id',component:Profile},
    {
        path:'admin',
        component:Dashboard,
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'users' },
            { path: 'users', component: AdminUsers },
            { path: 'posts', component: AdminPosts },
            { path: 'reports', component: AdminReports },
        ]
    },
    { path: '**', component: NotFoundComponent }

];
