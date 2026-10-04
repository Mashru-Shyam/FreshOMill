import { Directive, ElementRef, OnDestroy, effect, inject, input } from '@angular/core';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * How many dialogs currently want the page behind them frozen. A counter, not a boolean:
 * the cart drawer can sit open behind a confirm dialog, and whichever closes first must not
 * hand scrolling back while the other is still up.
 */
let scrollLockCount = 0;
let restoreRootOverflow = '';
let restoreBodyOverflow = '';
let restoreBodyPaddingRight = '';

/**
 * Makes an overlay behave like a real dialog: focus moves in when it opens, Tab cycles inside
 * it instead of walking onto the page behind, the page behind stops scrolling, and focus
 * returns to whatever opened it on close.
 *
 * Every modal in the panel (the product / category / order / slide / story forms) rendered as
 * a bare positioned div: no focus management, nothing stopping Tab from walking onto the table
 * behind it, and the page underneath still scrolling while a long form was open.
 *
 * Escape is deliberately *not* handled here — each page owns closing its own modal, since only
 * the page knows whether there's unsaved work to warn about.
 *
 * Character-for-character the same directive the storefront uses
 * (src/app/shared/util/dialog-focus.directive.ts), duplicated only because the two apps build
 * from separate roots and can't import across them.
 *
 * Usage: `<div [appDialogFocus]="isOpen()">`. Applies to the element that should contain
 * focus — the dialog panel, not the scrim.
 */
@Directive({
  selector: '[appDialogFocus]',
  host: {
    '(keydown)': 'onKeydown($event)',
  },
})
export class DialogFocus implements OnDestroy {
  readonly active = input.required<boolean>({ alias: 'appDialogFocus' });

  /**
   * Whether to freeze the page behind this dialog. True for anything that
   * covers the viewport with a scrim, because the scrim also hides the lane
   * left behind when the scrollbar is removed.
   *
   * False for an anchored popover: with nothing covering the page, that lane
   * shows as a pale strip down the right edge. Such a popover should close on
   * scroll instead, which is the behaviour a dropdown wants regardless.
   */
  readonly lockScroll = input(true, { alias: 'appDialogFocusLock' });

  private readonly host = inject(ElementRef<HTMLElement>);
  private previouslyFocused: HTMLElement | null = null;
  private locked = false;

  constructor() {
    effect((onCleanup) => {
      if (!this.active()) {
        this.release();
        return;
      }

      this.previouslyFocused = document.activeElement as HTMLElement | null;
      if (this.lockScroll()) {
        this.applyScrollLock();
      }

      // The panel's own content may still be rendering on the frame the flag flips (these
      // overlays animate in), so the focus move waits a frame rather than landing on nothing.
      const frame = requestAnimationFrame(() => this.focusFirst());
      onCleanup(() => cancelAnimationFrame(frame));
    });
  }

  /** Dialogs mounted behind `@if` are *removed*, not deactivated — the effect never sees the
   *  flag go false, so without this the body's scroll lock would outlive the dialog and leave
   *  the page permanently unscrollable. */
  ngOnDestroy(): void {
    this.release();
  }

  private focusFirst(): void {
    const element = this.host.nativeElement as HTMLElement;
    const targets = this.focusable();
    // Prefer a real control; fall back to the panel itself so focus at least enters the
    // dialog rather than staying on the page behind it.
    const first = targets[0] ?? element;
    if (!element.contains(document.activeElement)) {
      first.focus({ preventScroll: true });
    }
  }

  private focusable(): HTMLElement[] {
    const element = this.host.nativeElement as HTMLElement;
    return Array.from(element.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement
    );
  }

  protected onKeydown(event: Event): void {
    if (!this.active() || !(event instanceof KeyboardEvent) || event.key !== 'Tab') {
      return;
    }
    const targets = this.focusable();
    if (targets.length === 0) {
      event.preventDefault();
      return;
    }
    const first = targets[0];
    const last = targets[targets.length - 1];
    const current = document.activeElement as HTMLElement | null;

    if (event.shiftKey && (current === first || !this.host.nativeElement.contains(current))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private applyScrollLock(): void {
    if (this.locked) {
      return;
    }
    this.locked = true;
    if (scrollLockCount === 0) {
      const root = document.documentElement;

      // The lock has to go on <html>, not just <body>. The global stylesheet
      // sets `overflow-x: hidden` on <html>, which makes <html> the scrolling
      // element — so `body { overflow: hidden }` on its own locked nothing at
      // all, and every overlay (the account popover, the cart, the quick-add
      // sheet, the filters sheet) let the page keep scrolling underneath it.
      // Both are set: <html> is what actually scrolls here, and <body> covers
      // the case where a future style change moves the scroll container back.
      const scrollbarWidth = window.innerWidth - root.clientWidth;
      restoreRootOverflow = root.style.overflow;
      restoreBodyOverflow = document.body.style.overflow;
      restoreBodyPaddingRight = document.body.style.paddingRight;

      // Removing the scrollbar widens the viewport by its width and reflows the
      // whole page — read as the page jumping the instant a dialog opens.
      // Replacing it with padding keeps the layout exactly where it was.
      if (scrollbarWidth > 0) {
        const current = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
        document.body.style.paddingRight = `${current + scrollbarWidth}px`;
      }
      root.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }
    scrollLockCount += 1;
  }

  private release(): void {
    if (this.locked) {
      this.locked = false;
      scrollLockCount = Math.max(0, scrollLockCount - 1);
      if (scrollLockCount === 0) {
        document.documentElement.style.overflow = restoreRootOverflow;
        document.body.style.overflow = restoreBodyOverflow;
        document.body.style.paddingRight = restoreBodyPaddingRight;
      }
    }
    // Take focus back when it's still inside the dialog we're closing, or when it's been
    // orphaned onto <body> because the dialog's DOM was removed under it. If the user has
    // already clicked somewhere else, yanking focus would be the more disruptive move.
    const element = this.host.nativeElement as HTMLElement;
    const active = document.activeElement;
    const focusWasOurs = element.contains(active) || active === null || active === document.body;
    if (this.previouslyFocused?.isConnected && focusWasOurs) {
      this.previouslyFocused.focus({ preventScroll: true });
    }
    this.previouslyFocused = null;
  }
}
