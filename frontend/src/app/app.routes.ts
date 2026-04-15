import { Routes } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { AuthPage } from './auth-page/auth-page';
import { Home } from './home/home';
import { AuthGuard } from './security/auth.guard';
import { AuthRedirect } from './auth-redirect/auth-redirect';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'home', component: Home },
    { path: 'login', component: AuthPage },
    { path: 'admin', component: Navbar, canActivate: [AuthGuard] },
    { path: '**', component: AuthRedirect }
];
