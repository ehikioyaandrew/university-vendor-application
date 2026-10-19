import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { SessionService } from '../core/session.service';
import { Shop } from '../core/models';
import { HeaderComponent } from '../shell/header.component';

@Component({
  selector: 'app-dashboard',
  imports: [HeaderComponent, RouterLink, FormsModule, DecimalPipe],
  template: `
    <app-header />
    <main class="wrap shell">
      <aside class="sidenav">
        <a routerLink="/market">Market</a>
        @if (shop) { <a [routerLink]="['/shops', shop.documentId]">My shop</a> }
        <a class="on" routerLink="/dashboard">Dashboard</a>
      </aside>
      <div>
        @if (!token) {
          <p class="lead">Log in to open your stall.</p>
          <a class="btn orange" routerLink="/login">Log in</a>
        } @else if (shop) {
          <header class="dash-hero">
            <p>{{ shop.name }} · {{ shop.spot }}</p>
            <h1>{{ shop.products?.length ?? 0 }} items</h1>
            <p>Orders, who owes you, and the day summary are the next slice. Listing is live.</p>
          </header>
          <form class="form" style="margin-top:16px" (ngSubmit)="add()">
            <label>Item name <input name="item" [(ngModel)]="itemName" required /></label>
            <label>Price in naira <input name="price" type="number" [(ngModel)]="price" required /></label>
            @if (error) { <p class="error">{{ error }}</p> }
            <button class="btn orange" type="submit">Add item</button>
          </form>
          <div class="grid">
            @for (item of shop.products ?? []; track item.documentId) {
              <a class="card" [routerLink]="['/items', item.documentId]">
                <div class="card-body">
                  <p class="price">₦{{ item.price | number }}</p>
                  <h2>{{ item.name }}</h2>
                </div>
              </a>
            }
          </div>
        } @else {
          <p class="lead">Loading your shop…</p>
        }
      </div>
    </main>
  `,
})
export class DashboardComponent {
  private readonly api = inject(ApiService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  shop: Shop | null = null;
  token = this.session.token();
  itemName = '';
  price = 0;
  error = '';

  constructor() {
    if (!this.token) return;
    this.load();
  }

  add() {
    if (!this.token) return;
    this.api.addProduct(this.token, { name: this.itemName, price: Number(this.price) }).subscribe({
      next: () => {
        this.itemName = '';
        this.price = 0;
        this.load();
      },
      error: () => (this.error = 'That item was not saved.'),
    });
  }

  private load() {
    if (!this.token) return;
    this.api.myShop(this.token).subscribe({
      next: (response) => (this.shop = response.data),
      error: () => {
        this.session.clear();
        this.router.navigateByUrl('/login');
      },
    });
  }
}
