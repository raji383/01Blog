import { Component, inject, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AdminReportResponse } from '../../models/user';

@Component({
  selector: 'app-admin-reports',
  imports: [NgFor, NgIf],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.css',
})
export class AdminReports {
  private readonly http = inject(HttpClient);

  protected readonly reports = signal<AdminReportResponse[]>([]);
  protected readonly loading = signal(true);

  ngOnInit() {
    this.loadReports();
  }

  protected dismissReport(report: AdminReportResponse): void {
    if (!window.confirm(`Dismiss report #${report.id}?`)) {
      return;
    }

    this.http.delete(`http://localhost:8080/api/reports/admin/${report.id}`).subscribe({
      next: () => {
        this.reports.update(reports => reports.filter(current => current.id !== report.id));
      },
      error: (error) => {
        console.error('Error dismissing report:', error);
        window.alert(`Failed to dismiss report #${report.id}`);
      }
    });
  }

  private loadReports(): void {
    this.loading.set(true);
    this.http.get<AdminReportResponse[]>('http://localhost:8080/api/reports/admin').subscribe({
      next: (reports) => {
        this.reports.set(reports ?? []);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error fetching reports:', error);
        this.reports.set([]);
        this.loading.set(false);
      }
    });
  }
}
