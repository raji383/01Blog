import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import type { UserProfileResponse } from '../models/user';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly storageKey = 'auth_token';
  private currentUserRequestInFlight = false;

  private readonly user = signal<UserProfileResponse | null>(null);
  readonly isLoadingCurrentUser = signal(false);
  readonly currentUserError = signal<string | null>(null);

  setUser(u: UserProfileResponse | null) {
    this.user.set(u);
  }

  updateUser(updater: (user: UserProfileResponse | null) => UserProfileResponse | null) {
    this.user.update(updater);
  }

  getUser() {
    return this.user;
  }

  setSession(token: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.storageKey, token);
  }

  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem(this.storageKey);
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

  getCurrentUserId(): number | null {
    return this.getTokenPayload()?.id ?? null;
  }

  getCurrentUserRole(): string | null {
    return this.getTokenPayload()?.role ?? null;
  }

  loadCurrentUser(force = false): void {
    if (!this.getToken()) {
      this.clearSession();
      return;
    }

    if (this.currentUserRequestInFlight || (!force && this.user())) {
      return;
    }

    this.currentUserRequestInFlight = true;
    this.isLoadingCurrentUser.set(true);
    this.currentUserError.set(null);

    this.http.get<UserProfileResponse>('/api/users/me').subscribe({
      next: (user) => {
        this.user.set(user);
        this.isLoadingCurrentUser.set(false);
        this.currentUserError.set(null);
        this.currentUserRequestInFlight = false;
      },
      error: (err) => {
        this.currentUserError.set('Failed to load current user');
        this.isLoadingCurrentUser.set(false);
        this.currentUserRequestInFlight = false;

        if (err.status === 401) {
          this.clearSession();
        }
      }
    });
  }

  clearSession() {
    this.user.set(null);
    this.currentUserError.set(null);
    this.isLoadingCurrentUser.set(false);
    this.currentUserRequestInFlight = false;

    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(this.storageKey);
  }

  private getTokenPayload(): { exp?: number; role?: string; id?: number; sub?: string } | null {
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
