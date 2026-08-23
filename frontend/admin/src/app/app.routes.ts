import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Layout } from './shared/layout/layout';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: Layout,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'products', pathMatch: 'full' },
      { path: 'products', loadComponent: () => import('./pages/products/products').then((m) => m.Products) },
      { path: 'categories', loadComponent: () => import('./pages/categories/categories').then((m) => m.Categories) },
      { path: 'orders', loadComponent: () => import('./pages/orders/orders').then((m) => m.Orders) },
      { path: 'hero-slides', loadComponent: () => import('./pages/hero-slides/hero-slides').then((m) => m.HeroSlides) },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings').then((m) => m.Settings) },
    ],
  },
];
