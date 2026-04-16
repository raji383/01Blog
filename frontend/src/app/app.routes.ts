import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found-component/not-found-component';
import { Home } from './home/home';
import { Auth } from './auth/auth';

export const routes: Routes = [
    { path: '', component: Home },
    {path:'login',component:Auth},
    { path: '**', component: NotFoundComponent }

];
