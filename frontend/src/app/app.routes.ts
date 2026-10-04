import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

/**
 * Home is imported eagerly — it's the landing route, so deferring it would only
 * add a round trip before first paint. Every other page is a `loadComponent`,
 * and `withPreloading(PreloadAllModules)` in app.config.ts fetches those chunks
 * in the background as soon as the app is idle.
 *
 * The effect is both-ways: the initial bundle no longer carries Checkout,
 * Profile, Orders and Contact (which most visits never open), and by the time a
 * shopper clicks through to any of them the chunk is already cached, so
 * navigation is immediate rather than waiting on a fetch.
 */
export const routes: Routes = [
  { path: '', component: Home, title: 'FreshOMill — Freshly milled flour & organic essentials' },
  {
    path: 'store',
    loadComponent: () => import('./pages/store/store').then((m) => m.Store),
    title: 'Shop all products — FreshOMill',
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout),
    title: 'Checkout — FreshOMill',
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
    title: 'Contact us — FreshOMill',
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
    title: 'My profile — FreshOMill',
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/orders').then((m) => m.Orders),
    title: 'My orders — FreshOMill',
  },
];
