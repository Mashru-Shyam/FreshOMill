import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { OverlayService } from '../services/overlay.service';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { Icon } from '../icon/icon';

/**
 * Persistent bottom tab bar shown on small/tablet devices (≤960px, same cutoff Navbar
 * collapses its own nav links/store link/profile+cart icons at — see navbar.css) — replaces
 * the old off-canvas sidebar drawer entirely. Home/Store/Contact are plain route links;
 * Cart/Profile open the same shared overlays Navbar's icons do (cart drawer, profile
 * popover), so there's exactly one cart drawer and one profile popover in the app, just two
 * possible triggers depending on viewport width.
 */
@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.css',
})
export class BottomNav {
  @ViewChild('profileBtn') private readonly profileBtn?: ElementRef<HTMLButtonElement>;

  constructor(
    protected readonly overlay: OverlayService,
    protected readonly auth: AuthService,
    protected readonly cart: CartService
  ) {}

  protected openCart(): void {
    this.overlay.openCartDrawer();
  }

  /** Anchor is computed the same way Navbar.onProfileToggleClick() does — it's only ever
   *  actually used ≥961px there; here it's always ≤960px so OverlayService.openProfile()
   *  forces the bottom-sheet layout regardless, but computing a real anchor anyway costs
   *  nothing and keeps the two triggers symmetric. */
  protected onProfileClick(event: MouseEvent): void {
    event.stopPropagation();
    const rect = this.profileBtn?.nativeElement.getBoundingClientRect();
    const anchor = rect ? { top: rect.top, right: window.innerWidth - rect.right } : null;
    this.overlay.toggleProfile(anchor);
  }
}
