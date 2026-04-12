import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Report {
  id: number;
  reason: string;
  createdAt: string;
  reporter: {
    id: number;
    username: string;
  };
  reportedUser: {
    id: number;
    username: string;
  };
}

export interface ReportRequest {
  reportedUserId: number;
  reason: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private readonly apiUrl = 'http://localhost:8081/api/reports';

  constructor(private http: HttpClient) {}

  createReport(report: ReportRequest): Observable<Report> {
    return this.http.post<Report>(this.apiUrl, report);
  }

  getAllReports(): Observable<Report[]> {
    return this.http.get<Report[]>(this.apiUrl);
  }
}