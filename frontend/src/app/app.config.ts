import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { PreloadAllModules, provideRouter, withInMemoryScrolling, withPreloading } from '@angular/router';

import { routes } from './app.routes';
import { authInterceptor } from './shared/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      /**
       * Without this the router leaves the scroll position exactly where it was
       * on the previous page. Jumping from a scrolled Home to /store dropped you
       * partway down the new page — below the banner and the category rail, with
       * the product grid's lazy images not yet in view. Any interaction that
       * caused a scroll then brought them in, which is what made it look like
       * images "only appear after you do something".
       *
       * 'enabled' also restores the previous offset on a back navigation, so
       * returning from a product to the grid puts you back where you were
       * instead of at the top.
       */
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      /**
       * Every lazy route is fetched in the background once the app is idle, so
       * the code-splitting above costs nothing on click — the chunk is already
       * in the browser cache by the time anyone navigates.
       */
      withPreloading(PreloadAllModules)
    ),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
  ],
};
