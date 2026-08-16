import { Component, HostListener } from '@angular/core';
import { ConfirmService } from '../services/confirm.service';

/**
 * Presentational half of the confirm-prompt system (ConfirmService) — always mounted in the
 * shell, renders whenever ConfirmService.request() is non-null. Same self-contained
 * overlay+blur pattern as the quick-add modal/cart drawer rather than the shared
 * `<app-backdrop>`, since (unlike those) it can be triggered from *inside* another overlay
 * (e.g. removing a cart line from within the open cart drawer) and needs to sit above it.
 */
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  constructor(protected readonly confirmService: ConfirmService) {}

  protected confirm(): void {
    this.confirmService.respond(true);
  }

  protected cancel(): void {
    this.confirmService.respond(false);
  }

  protected onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.confirmService.request()) {
      this.cancel();
    }
  }
}
