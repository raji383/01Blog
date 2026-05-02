import { Component, inject, signal } from '@angular/core';
import { DatePipe, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AdminReportResponse } from '../../models/user';
import { DialogService } from '../../shared/ui/dialog/dialog.service';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-admin-reports',
  imports: [NgFor, NgIf, DatePipe, TitleCasePipe],
  templateUrl: './admin-reports.html',
  styleUrl: './admin-reports.css',
})
export class AdminReports {
  private readonly http = inject(HttpClient);
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);

  protected readonly reports = signal<AdminReportResponse[]>([]);
  protected readonly loading = signal(true);

  ngOnInit() {
    this.loadReports();
  }

  protected async dismissReport(report: AdminReportResponse): Promise<void> {
    const confirmed = await this.dialogService.confirm(`Dismiss report #${report.id}?`, {
      title: 'Dismiss report',
      confirmLabel: 'Dismiss'
    });

    if (!confirmed) {
      return;
    }

    this.http.delete(`/api/reports/admin/${report.id}`).subscribe({
      next: () => {
        this.reports.update(reports => reports.filter(current => current.id !== report.id));
      },
      error: (error) => {
        this.toastService.show(`Failed to dismiss report #${report.id}`, 'error');
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
        this.reports.set([]);
        this.loading.set(false);
      }
    });
  }
}
