import { Component } from '@angular/core';

import { AuthPage } from './auth-page/auth-page';

@Component({
  selector: 'app-root',
  imports: [AuthPage],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
