import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

/**
 * Warm the connection to the API before anything asks it for data.
 *
 * Every product photo, category tile and banner is served from the API origin,
 * which is a *different* host from the app itself. Without this, the very first
 * image request has to pay for a DNS lookup, a TCP handshake and a TLS
 * negotiation before a single byte of image arrives — several hundred
 * milliseconds on a mobile connection, and it happens at exactly the moment the
 * page is trying to paint.
 *
 * Done here rather than as a static tag in index.html so it always points at
 * whichever backend this build targets, with no second place to keep in sync.
 */
function preconnectToApi(): void {
  const apiOrigin = new URL(environment.apiBaseUrl, location.href).origin;
  if (apiOrigin === location.origin) {
    return;
  }
  for (const rel of ['preconnect', 'dns-prefetch']) {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = apiOrigin;
    // Images are fetched without credentials, so the warmed socket has to be
    // the anonymous one or the browser opens a second connection anyway.
    if (rel === 'preconnect') {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  }
}

preconnectToApi();

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
