import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found-component/not-found-component';
import { Home } from './home/home';
import { Auth } from './auth/auth';
import { Profile } from './profile/profile';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
    { path: '', component: Home },
    {path:'login',component:Auth},
    {path:'profile/:id',component:Profile},
    {path:'admin',component:Dashboard},
    { path: '**', component: NotFoundComponent }

];
