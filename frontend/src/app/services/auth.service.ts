import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  getCurrentUsername(): string {
    if (typeof window === 'undefined') return 'anonymous';
    try {
      const s = localStorage.getItem('auth_username');
      if (!s) return 'anonymous';
      const u = JSON.parse(s);
      return u?.username || 'anonymous';
    } catch (e) {
      return 'anonymous';
    }
  }
}
