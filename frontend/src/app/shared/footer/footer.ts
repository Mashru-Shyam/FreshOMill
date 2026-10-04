import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StoreSettingsService } from '../services/store-settings.service';
import { Icon } from '../icon/icon';

/**
 * Site footer (Sample/FreshOMill.html's `.site-footer`, `#site-footer`
 * copied verbatim onto Sample/Store.html too) — lives in the shared shell,
 * not a page component, since both mockup pages ship it identically.
 * Social icons are inline SVGs, not Lucide: the mockup's comment notes
 * Lucide dropped its brand/social glyphs (instagram/youtube/linkedin all
 * 404 against the icon CDN), so `lucide.createIcons()` has nothing to
 * render for them — these are the equivalent Feather-style outline paths.
 *
 * Address / hours / phone / e-mail come from StoreSettingsService, the same admin-managed
 * record the Contact page and WhatsApp button read, so a change in the admin panel updates
 * the footer too. A social link whose URL is unset renders no icon rather than an anchor
 * pointing at nothing.
 */
@Component({
  selector: 'app-footer',
  imports: [RouterLink, Icon],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  protected readonly storeSettings = inject(StoreSettingsService);
  protected readonly year = new Date().getFullYear();
}
