import { Component } from '@angular/core';

import { AuthBrandPanel } from './auth-brand-panel/auth-brand-panel';
import { AuthCard } from './auth-card/auth-card';

@Component({
  selector: 'app-auth-page',
  imports: [AuthBrandPanel, AuthCard],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.css',
})
export class AuthPage {}
