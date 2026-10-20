import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing.component';
import { SignupComponent } from './pages/signup.component';
import { LoginComponent } from './pages/login.component';
import { MarketComponent } from './pages/market.component';
import { ItemComponent } from './pages/item.component';
import { StoreComponent } from './pages/store.component';
import { DashboardComponent } from './pages/dashboard.component';
import { DashHomeComponent } from './pages/dash/home.component';
import { DashItemsComponent } from './pages/dash/items.component';
import { DashOrdersComponent } from './pages/dash/orders.component';
import { DashShopComponent } from './pages/dash/shop.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'market', component: MarketComponent },
  { path: 'items/:id', component: ItemComponent },
  { path: 'shops/:id', component: StoreComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '', component: DashHomeComponent },
      { path: 'items', component: DashItemsComponent },
      { path: 'orders', component: DashOrdersComponent },
      { path: 'shop', component: DashShopComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
