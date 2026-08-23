import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

/** Server-side gating (RequireAuthorization("Admin") on every endpoint) is what actually
 * protects the data — this guard is UX only, keeping a signed-out or non-admin visitor off
 * screens that would otherwise just show empty tables/401s. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);

  if (auth.isLoggedIn() && auth.isAdmin()) {
    return true;
  }

  return router.parseUrl('/login');
};
