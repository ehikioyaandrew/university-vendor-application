import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { SessionService } from '../../core/session.service';
import { Category, Order, SalesBook, SalesRange, Shop } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class StallStore {
  private readonly api = inject(ApiService);
  private readonly session = inject(SessionService);
  shop: Shop | null = null;
  orders: Order[] = [];
  categories: Category[] = [];
  book: SalesBook | null = null;
  range: SalesRange = 'day';
  ready = false;

  get token() {
    return this.session.token();
  }

  load() {
    const token = this.token;
    if (!token) return;
    this.api.myShop(token).subscribe({
      next: (response) => {
        this.shop = response.data;
        this.ready = true;
      },
      error: () => {
        this.session.clear();
        this.ready = true;
      },
    });
    this.api.categories().subscribe({
      next: (response) => (this.categories = response.data ?? []),
    });
    this.refreshLive();
  }

  setRange(range: SalesRange) {
    this.range = range;
    this.refreshLive();
  }

  refreshLive() {
    const token = this.token;
    if (!token) return;
    this.api.orders(token).subscribe({
      next: (response) => (this.orders = response.data ?? []),
      error: () => (this.orders = []),
    });
    this.api.summary(token, this.range).subscribe({
      next: (response) => (this.book = response.data),
    });
  }
}
