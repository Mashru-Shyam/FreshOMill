import { Component } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';

/**
 * Profile page's `.account-summary` block (Sample/Profile.html) — avatar
 * initial + email + a static hint line. Only ever rendered while signed in
 * (the parent page gates on that), so `auth.currentUser()` is read directly
 * without a null-safe fallback beyond the optional chaining Angular's
 * template type-checking requires.
 *
 * The initial-letter avatar mirrors the navbar's `.profile-avatar` treatment
 * (shared/navbar/navbar.html: `auth.currentUser()?.email?.charAt(0)`, with
 * `text-transform: uppercase` doing the casing in CSS rather than `.toUpperCase()`
 * in the template) so both places stay visually identical without duplicating logic.
 */
@Component({
  selector: 'app-account-summary',
  templateUrl: './account-summary.html',
  styleUrl: './account-summary.css',
})
export class AccountSummary {
  constructor(protected readonly auth: AuthService) {}
}
