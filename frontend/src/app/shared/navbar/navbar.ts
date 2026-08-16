import { Component, ElementRef, HostListener, ViewChild, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { OverlayService } from '../services/overlay.service';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { SearchDropdown } from '../search-dropdown/search-dropdown';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, SearchDropdown, Icon],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  @ViewChild('profileToggleBtn') private readonly profileToggleBtn?: ElementRef<HTMLButtonElement>;
  @ViewChild('searchWrap') private readonly searchWrap?: ElementRef<HTMLElement>;

  protected readonly logoFailed = signal(false);
  protected readonly query = signal('');

  constructor(
    protected readonly overlay: OverlayService,
    protected readonly auth: AuthService,
    protected readonly cart: CartService
  ) {}

  // protected onLogoError(event: Event): void {
  //   this.logoFailed.set(true);
  //   (event.target as HTMLImageElement).style.display = 'none';
  // }

  protected onSearchFocus(): void {
    this.overlay.openDesktopSearch();
  }

  protected onSearchInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  protected clearSearch(): void {
    this.query.set('');
  }

  protected onProfileToggleClick(event: MouseEvent): void {
    event.stopPropagation();
    const rect = this.profileToggleBtn?.nativeElement.getBoundingClientRect();
    const anchor = rect ? { top: rect.bottom + 8, right: window.innerWidth - rect.right } : null;
    this.overlay.toggleProfile(anchor);
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (this.overlay.desktopSearchOpen() && !this.searchWrap?.nativeElement.contains(event.target as Node)) {
      this.overlay.closeDesktopSearch();
    }
  }
}
