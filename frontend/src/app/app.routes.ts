import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Store } from './pages/store/store';
import { Checkout } from './pages/checkout/checkout';
import { Contact } from './pages/contact/contact';
import { Profile } from './pages/profile/profile';
import { Orders } from './pages/orders/orders';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'store', component: Store },
  { path: 'checkout', component: Checkout },
  { path: 'contact', component: Contact },
  { path: 'profile', component: Profile },
  { path: 'orders', component: Orders },
];
