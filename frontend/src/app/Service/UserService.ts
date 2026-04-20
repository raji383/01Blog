import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserService {

  private user = signal<any | null>(null);

  setUser(u: any) {
    this.user.set(u);
  }

  getUser() {
    return this.user;
  }
}