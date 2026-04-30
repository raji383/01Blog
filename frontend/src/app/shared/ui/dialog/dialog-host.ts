import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogService } from './dialog.service';

@Component({
  selector: 'app-dialog-host',
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-host.html',
  styleUrl: './dialog-host.css',
})
export class DialogHost {
  protected readonly dialogService = inject(DialogService);

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.dialogService.cancel();
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.dialogService.activeDialog()) {
      this.dialogService.cancel();
    }
  }
}
