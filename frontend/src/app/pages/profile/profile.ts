import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { OverlayService } from '../../shared/services/overlay.service';
import { Icon } from '../../shared/icon/icon';
import { AccountSummary } from './account-summary/account-summary';
import { AccountForm } from './account-form/account-form';
import { AddressList } from './address-list/address-list';

/**
 * Profile page (Sample/Profile.html, everything below the shared
 * navbar/search chrome). Signed-out visitors see the same `.checkout-empty`
 * gate pattern Checkout uses (`.account-gate` trims its vertical padding a
 * touch, matching Profile.html's own override); its CTA opens the sign-in
 * popover un-anchored (`openProfile(null)`) — the same documented deviation
 * CartDrawer's checkout-gate CTA takes, since there's no navbar
 * profile-button element reference available from a routed page body.
 *
 * Signed-in: account summary (avatar/email), then the mockup's "Basic
 * Information" form (name/phone + delivery address — see account-form.ts),
 * then a "Saved Addresses" section (address-list.ts).
 *
 * Deviation from the mockup: Profile.html's "Basic Information" section
 * persists to its own flat, single-record localStorage key, and has no
 * saved-address *list* at all — only ever one implicit address. This port
 * instead backs that same form with AddressService's default address
 * (add-or-update), and adds a "Saved Addresses" section on top so multiple
 * saved addresses (e.g. added from Checkout) have somewhere to be viewed,
 * edited, removed, or promoted to default. AddressService's own doc
 * comment names Profile as the page that "manages saved addresses", and
 * it's a full list-shaped store, so this fills in real estate the mockup
 * never needed (a single implicit record) now that the store supports many.
 *
 * There's no logout button here — Profile.html doesn't have one either;
 * it lives in the shared profile popover (`logoutActionBtn` in the mockup,
 * `ProfilePopover.logout()` in the port).
 */
@Component({
  selector: 'app-profile-page',
  imports: [RouterLink, AccountSummary, AccountForm, AddressList, Icon],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  constructor(
    protected readonly auth: AuthService,
    private readonly overlay: OverlayService
  ) {}

  /** Mirrors CartDrawer.openSignIn() — opens the account popover un-anchored. */
  protected openSignIn(): void {
    this.overlay.openProfile(null);
  }
}
