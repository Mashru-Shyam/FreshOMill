import { API_BASE_URL } from '../config/api.config';

/** The backend returns image paths relative to itself for seeded/legacy data (e.g.
 *  "/images/products/…"), but admin-uploaded images are stored as full absolute URLs (see the
 *  admin app's ImagesService.upload). Prefixing unconditionally with API_BASE_URL breaks the
 *  latter by doubling the origin, so only prefix when the value isn't already absolute. */
export function toAbsoluteImageUrl(url: string | null): string {
  if (!url) {
    return '';
  }
  return /^https?:\/\//i.test(url) ? url : `${API_BASE_URL}${url}`;
}
