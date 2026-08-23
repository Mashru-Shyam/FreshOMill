import { API_BASE_URL } from '../config/api.config';

/** The backend always returns image paths relative to itself (e.g. "/images/products/…") — the
 *  customer app already prefixes these with its own API_BASE_URL when mapping DTOs (see
 *  product.service.ts), but the admin services were returning the raw relative path straight
 *  through. That's harmless from the *backend's* own Swagger/API-docs perspective, but rendered
 *  as an <img src> in the admin app (served from its own origin, localhost:4300) it resolves
 *  against the wrong host and 404s. Already-absolute URLs (e.g. straight out of ImagesService's
 *  own upload response) pass through unchanged, so this is safe to apply unconditionally. */
export function toAbsoluteImageUrl(url: string | null): string | null {
  if (!url) {
    return url;
  }
  return /^https?:\/\//i.test(url) ? url : `${API_BASE_URL}${url}`;
}
