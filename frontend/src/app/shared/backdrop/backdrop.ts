import { Component, computed } from '@angular/core';
import { OverlayService } from '../services/overlay.service';

/**
 * Shared top-level backdrop overlay (Sample/Store.html's `.drawer-backdrop`)
 * behind the profile popover's mobile bottom-sheet mode. Clicking it closes
 * whatever is open, same as the mockup's
 * `drawerBackdrop.addEventListener('click', ...)`.
 */
@Component({
  selector: 'app-backdrop',
  templateUrl: './backdrop.html',
  styleUrl: './backdrop.css',
})
export class Backdrop {
  protected readonly visible = computed(() => this.overlay.profileOpen() && this.overlay.profileIsBottomSheet());

  constructor(protected readonly overlay: OverlayService) {}
}
