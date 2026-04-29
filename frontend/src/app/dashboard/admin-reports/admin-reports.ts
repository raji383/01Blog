import { Component, inject, signal } from '@angular/core';
import { DatePipe, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AdminReportResponse } from '../../models/user';

@Component({
  selector: 'app-admin-reports',
  imports: [NgFor, NgIf, DatePipe, TitleCasePipe],
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

    this.http.delete(`/api/reports/admin/${report.id}`).subscribe({
      next: () => {
        this.reports.update(reports => reports.filter(current => current.id !== report.id));
      },
      error: (error) => {
        console.error('Error dismissing report:', error);
        window.alert(`Failed to dismiss report #${report.id}`);
      }
    });
  }

  protected isVideoMedia(mediaUrl: string | null): boolean {
    if (!mediaUrl) {
      return false;
    }

    const normalizedUrl = mediaUrl.toLowerCase().split('?')[0];
    return normalizedUrl.endsWith('.mp4')
      || normalizedUrl.endsWith('.webm')
      || normalizedUrl.endsWith('.mov');
  }

  private loadReports(): void {
    this.loading.set(true);
    this.http.get<AdminReportResponse[]>('/api/reports/admin').subscribe({
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
