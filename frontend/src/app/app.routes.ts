import { Routes } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { AuthPage } from './auth-page/auth-page';

export const routes: Routes = [
    { path: '', component: AuthPage },
    { path: 'login', component: AuthPage },
    { path: 'admin', component: Navbar },
    { path: '**', redirectTo: '' }
];
