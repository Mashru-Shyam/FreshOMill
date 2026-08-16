import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  readonly message: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly danger: boolean;
}

interface PendingConfirm extends ConfirmRequest {
  readonly resolve: (confirmed: boolean) => void;
}

export interface ConfirmOptions {
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly pending = signal<PendingConfirm | null>(null);
  readonly request = this.pending.asReadonly();

  confirm(message: string, options?: ConfirmOptions): Promise<boolean> {
    this.pending()?.resolve(false);

    return new Promise<boolean>((resolve) => {
      this.pending.set({
        message,
        confirmLabel: options?.confirmLabel ?? 'Confirm',
        cancelLabel: options?.cancelLabel ?? 'Cancel',
        danger: options?.danger ?? false,
        resolve,
      });
    });
  }

  respond(confirmed: boolean): void {
    this.pending()?.resolve(confirmed);
    this.pending.set(null);
  }
}
