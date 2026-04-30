import { Injectable, signal } from '@angular/core';

type DialogKind = 'alert' | 'confirm' | 'prompt';
type DialogTone = 'default' | 'danger';

interface DialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  placeholder?: string;
  initialValue?: string;
  tone?: DialogTone;
}

interface DialogRequest extends DialogOptions {
  type: DialogKind;
  value: string;
  resolve: (value?: unknown) => void;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  readonly activeDialog = signal<DialogRequest | null>(null);

  alert(message: string, options: Partial<DialogOptions> = {}): Promise<void> {
    return new Promise<void>((resolve) => {
      this.activeDialog.set({
        type: 'alert',
        title: options.title ?? 'Notice',
        message,
        confirmLabel: options.confirmLabel ?? 'Close',
        cancelLabel: options.cancelLabel,
        placeholder: options.placeholder,
        initialValue: options.initialValue,
        tone: options.tone ?? 'default',
        value: options.initialValue ?? '',
        resolve: () => resolve()
      });
    });
  }

  confirm(message: string, options: Partial<DialogOptions> = {}): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.activeDialog.set({
        type: 'confirm',
        title: options.title ?? 'Confirm action',
        message,
        confirmLabel: options.confirmLabel ?? 'Confirm',
        cancelLabel: options.cancelLabel ?? 'Cancel',
        placeholder: options.placeholder,
        initialValue: options.initialValue,
        tone: options.tone ?? 'default',
        value: options.initialValue ?? '',
        resolve: (value) => resolve(Boolean(value))
      });
    });
  }

  prompt(message: string, options: Partial<DialogOptions> = {}): Promise<string | null> {
    return new Promise<string | null>((resolve) => {
      this.activeDialog.set({
        type: 'prompt',
        title: options.title ?? 'Input required',
        message,
        confirmLabel: options.confirmLabel ?? 'Submit',
        cancelLabel: options.cancelLabel ?? 'Cancel',
        placeholder: options.placeholder,
        initialValue: options.initialValue,
        tone: options.tone ?? 'default',
        value: options.initialValue ?? '',
        resolve: (value) => resolve((value as string | null | undefined) ?? null)
      });
    });
  }

  updateValue(value: string): void {
    this.activeDialog.update((dialog) => dialog ? { ...dialog, value } : dialog);
  }

  submit(): void {
    const dialog = this.activeDialog();
    if (!dialog) {
      return;
    }

    this.activeDialog.set(null);

    if (dialog.type === 'alert') {
      dialog.resolve();
      return;
    }

    if (dialog.type === 'confirm') {
      dialog.resolve(true);
      return;
    }

    dialog.resolve(dialog.value.trim() || null);
  }

  cancel(): void {
    const dialog = this.activeDialog();
    if (!dialog) {
      return;
    }

    this.activeDialog.set(null);

    if (dialog.type === 'confirm') {
      dialog.resolve(false);
      return;
    }

    if (dialog.type === 'prompt') {
      dialog.resolve(null);
      return;
    }

    dialog.resolve();
  }
}

export type { DialogRequest };
