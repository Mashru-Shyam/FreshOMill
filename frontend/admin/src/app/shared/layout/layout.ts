import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AdminAuthService } from '../../core/services/admin-auth.service';

interface NavItem {
  readonly path: string;
  readonly label: string;
  /** Lucide path data, inlined — the panel has no icon component and pulling one in for six
   *  glyphs would cost more than it saves. */
  readonly paths: readonly string[];
}

interface NavGroup {
  readonly title: string;
  readonly items: readonly NavItem[];
}

/**
 * Admin shell. Two things changed here beyond the visuals:
 *
 *  - the sidebar is an off-canvas drawer below 960px instead of a permanent 232px column,
 *    which on a phone left roughly 150px for the data tables it navigates to;
 *  - the six flat links are grouped into what an operator uses daily (Catalogue) versus
 *    what they edit occasionally (Storefront), each with an icon to anchor the row.
 */
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  protected readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);

  protected readonly navOpen = signal(false);

  protected readonly initial = computed(() => this.auth.currentUser()?.email?.charAt(0).toUpperCase() ?? '?');

  protected readonly navGroups: readonly NavGroup[] = [
    {
      title: 'Catalogue',
      items: [
        {
          path: '/products',
          label: 'Products',
          paths: ['m7.5 4.27 9 5.15', 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z', 'm3.3 7 8.7 5 8.7-5', 'M12 22V12'],
        },
        {
          path: '/categories',
          label: 'Categories',
          paths: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'],
        },
        {
          path: '/orders',
          label: 'Orders',
          paths: ['M8 2v4', 'M16 2v4', 'M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'm9 16 2 2 4-4'],
        },
      ],
    },
    {
      title: 'Storefront',
      items: [
        {
          path: '/hero-slides',
          label: 'Image Slider',
          paths: ['M3 5h18v14H3z', 'm3 15 5-5 4 4 3-3 6 6'],
        },
        {
          path: '/customer-stories',
          label: 'Customer Stories',
          paths: ['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
        },
        {
          path: '/settings',
          label: 'Settings',
          paths: ['M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
        },
      ],
    },
  ];

  constructor() {
    // A drawer left open across a route change would cover the page the operator just asked
    // for. Links close it themselves; this covers back/forward navigation too.
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe(() => this.navOpen.set(false));
  }

  protected toggleNav(): void {
    this.navOpen.update((open) => !open);
  }

  protected closeNav(): void {
    this.navOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeNav();
  }

  protected logout(): void {
    this.auth.logout();
    location.href = '/login';
  }
}
