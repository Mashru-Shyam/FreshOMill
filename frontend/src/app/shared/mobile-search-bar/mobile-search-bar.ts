import { Component, ElementRef, HostListener, ViewChild, signal } from '@angular/core';
import { OverlayService } from '../services/overlay.service';
import { SearchDropdown } from '../search-dropdown/search-dropdown';
import { Icon } from '../icon/icon';

/**
 * Full-width search row shown below the navbar on small/tablet screens
 * (Sample/Store.html's `.search-bar-row`, hidden ≥961px in favor of the
 * navbar's compact search box). Shares the same `<app-search-dropdown>`.
 */
@Component({
  selector: 'app-mobile-search-bar',
  imports: [SearchDropdown, Icon],
  templateUrl: './mobile-search-bar.html',
  styleUrl: './mobile-search-bar.css',
})
export class MobileSearchBar {
  @ViewChild('searchWrap') private readonly searchWrap?: ElementRef<HTMLElement>;

  protected readonly query = signal('');

  constructor(protected readonly overlay: OverlayService) {}

  protected onSearchFocus(): void {
    this.overlay.openMobileSearch();
  }

  protected onSearchInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected clearSearch(): void {
    this.query.set('');
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.overlay.mobileSearchOpen() && !this.searchWrap?.nativeElement.contains(event.target as Node)) {
      this.overlay.closeMobileSearch();
    }
  }
}
