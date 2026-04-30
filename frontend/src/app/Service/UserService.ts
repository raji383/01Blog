import { Injectable, signal } from '@angular/core';
import type { UserProfileResponse } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly user = signal<UserProfileResponse | null>(null);

  setUser(u: UserProfileResponse | null) {
    this.user.set(u);
  }

  updateUser(updater: (user: UserProfileResponse | null) => UserProfileResponse | null) {
    this.user.update(updater);
  }

  getUser() {
    return this.user;
  }

  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem('auth_token') || window.localStorage.getItem('token');
  }

  hasValidSession(): boolean {
    const payload = this.getTokenPayload();
    if (!payload?.exp) {
      return false;
    }

    return payload.exp * 1000 > Date.now();
  }

  hasRole(role: string): boolean {
    return this.getTokenPayload()?.role === role;
  }

  clearSession() {
    this.user.set(null);

    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem('auth_token');
    window.localStorage.removeItem('token');
  }

  private getTokenPayload(): { exp?: number; role?: string } | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }
}
