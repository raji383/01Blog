import { Routes } from '@angular/router';
import { NotFoundComponent } from './not-found-component/not-found-component';
import { Home } from './home/home';

export const routes: Routes = [
    { path: '', component: Home },
    { path: '**', component: NotFoundComponent }

];
