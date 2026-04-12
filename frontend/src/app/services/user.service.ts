import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  subscriberCount: number;
  postCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = 'http://localhost:8081/api/users';

  constructor(private http: HttpClient) {}

  getProfile(username: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile/${username}`);
  }

  getAllUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/admin`);
  }

  toggleSubscription(userId: number): Observable<{ subscribed: boolean; subscriberCount: number }> {
    return this.http.post<{ subscribed: boolean; subscriberCount: number }>(`${this.apiUrl}/subscribe/${userId}`, {});
  }

  getSubscriptions(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(`${this.apiUrl}/subscriptions`);
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/admin/${userId}`);
  }
}