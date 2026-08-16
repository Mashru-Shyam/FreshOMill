import { Component, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopTicker } from '../top-ticker/top-ticker';
import { Navbar } from '../navbar/navbar';
import { MobileSearchBar } from '../mobile-search-bar/mobile-search-bar';
import { ProfilePopover } from '../profile-popover/profile-popover';
import { Backdrop } from '../backdrop/backdrop';
import { WhatsappButton } from '../whatsapp-button/whatsapp-button';
import { Footer } from '../footer/footer';
import { CartDrawer } from '../cart-drawer/cart-drawer';
import { QuickAddModal } from '../quick-add-modal/quick-add-modal';
import { Toast } from '../toast/toast';
import { ConfirmDialog } from '../confirm-dialog/confirm-dialog';
import { OverlayService } from '../services/overlay.service';
import { BottomNav } from '../bottom-nav/bottom-nav';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    TopTicker,
    Navbar,
    MobileSearchBar,
    ProfilePopover,
    BottomNav,
    Backdrop,
    WhatsappButton,
    Footer,
    CartDrawer,
    QuickAddModal,
    Toast,
    ConfirmDialog,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  constructor(private readonly overlay: OverlayService) {}

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.overlay.closeAll();
  }
}
