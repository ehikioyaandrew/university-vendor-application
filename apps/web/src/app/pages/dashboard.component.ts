import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { SessionService } from '../core/session.service';
import { Category, Order, Shop } from '../core/models';
import { assetUrl } from '../core/media';
import { HeaderComponent } from '../shell/header.component';
import { PhotoComponent } from '../shell/photo.component';

@Component({
  selector: 'app-dashboard',
  imports: [HeaderComponent, RouterLink, FormsModule, DecimalPipe, PhotoComponent],
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
          <app-photo kind="cover" [file]="shop.cover" [alt]="shop.name" fallback="#ff6a00" />
          <header class="dash-hero">
            <p>{{ shop.name }} · {{ shop.spot }}</p>
            <h1>{{ shop.products?.length ?? 0 }} items</h1>
            <p>Photos and receipt pictures are saved in the media library.</p>
          </header>
          <form class="form" style="margin-top:16px" (ngSubmit)="saveCover()">
            <label>Shop photo <input name="cover" type="file" accept="image/*" (change)="pickCover($event)" /></label>
            @if (coverError) { <p class="error">{{ coverError }}</p> }
            <button class="btn orange" type="submit" [disabled]="busy">Save shop photo</button>
          </form>
          <form class="form" style="margin-top:16px" (ngSubmit)="add()">
            <label>Item name <input name="item" [(ngModel)]="itemName" required /></label>
            <label>Category
              <select name="category" [(ngModel)]="category" required>
                @for (item of categories; track item.documentId) {
                  <option [value]="item.documentId">{{ item.name }}</option>
                }
              </select>
            </label>
            <label>Price in naira <input name="price" type="number" [(ngModel)]="price" required /></label>
            <label>Item photo <input name="photo" type="file" accept="image/*" (change)="pickItem($event)" /></label>
            @if (error) { <p class="error">{{ error }}</p> }
            <button class="btn orange" type="submit" [disabled]="busy">Add item</button>
          </form>
          <div class="grid">
            @for (item of shop.products ?? []; track item.documentId) {
              <a class="card" [routerLink]="['/items', item.documentId]">
                <app-photo [file]="item.image" [alt]="item.name" />
                <div class="card-body">
                  <p class="price">₦{{ item.price | number }}</p>
                  <h2>{{ item.name }}</h2>
                </div>
              </a>
            }
          </div>
          <div class="section-title">Receipts</div>
          <form class="form" (ngSubmit)="saveReceipt()">
            <label>Buyer <input name="buyer" [(ngModel)]="buyerName" required /></label>
            <label>Amount in naira <input name="amount" type="number" [(ngModel)]="amount" required /></label>
            <label>Receipt photo <input name="receipt" type="file" accept="image/*" (change)="pickReceipt($event)" /></label>
            @if (receiptError) { <p class="error">{{ receiptError }}</p> }
            <button class="btn orange" type="submit" [disabled]="busy">Save receipt</button>
          </form>
          @for (order of orders; track order.documentId) {
            <article class="order">
              <div>
                <strong>{{ order.buyerName }}</strong>
                <p class="by">₦{{ order.amount | number }} · {{ order.status }}</p>
              </div>
              @if (receiptSrc(order); as src) {
                <img class="receipt" [src]="src" alt="Receipt" />
              }
            </article>
          }
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
  orders: Order[] = [];
  categories: Category[] = [];
  category = '';
  token = this.session.token();
  itemName = '';
  price = 0;
  buyerName = '';
  amount = 0;
  error = '';
  coverError = '';
  receiptError = '';
  busy = false;
  private itemPhoto: File | null = null;
  private coverPhoto: File | null = null;
  private receiptPhoto: File | null = null;

  constructor() {
    if (!this.token) return;
    this.load();
  }

  pickItem(event: Event) {
    this.itemPhoto = this.fileFrom(event);
  }

  pickCover(event: Event) {
    this.coverPhoto = this.fileFrom(event);
  }

  pickReceipt(event: Event) {
    this.receiptPhoto = this.fileFrom(event);
  }

  receiptSrc(order: Order) {
    return assetUrl(order.receipt);
  }

  add() {
    if (!this.token) return;
    this.busy = true;
    this.error = '';
    this.withAsset(this.itemPhoto, (image) => {
      this.api.addProduct(this.token!, { name: this.itemName, price: Number(this.price), category: this.category, image }).subscribe({
        next: () => {
          this.itemName = '';
          this.price = 0;
          this.itemPhoto = null;
          this.busy = false;
          this.load();
        },
        error: () => {
          this.busy = false;
          this.error = 'That item was not saved.';
        },
      });
    }, () => {
      this.busy = false;
      this.error = 'That photo was not saved.';
    });
  }

  saveCover() {
    if (!this.token || !this.shop) return;
    if (!this.coverPhoto) {
      this.coverError = 'Choose a shop photo first.';
      return;
    }
    this.busy = true;
    this.coverError = '';
    this.withAsset(this.coverPhoto, (cover) => {
      this.api.updateShopCover(this.token!, this.shop!.documentId, cover!).subscribe({
        next: () => {
          this.coverPhoto = null;
          this.busy = false;
          this.load();
        },
        error: () => {
          this.busy = false;
          this.coverError = 'That shop photo was not saved.';
        },
      });
    }, () => {
      this.busy = false;
      this.coverError = 'That shop photo was not saved.';
    });
  }

  saveReceipt() {
    if (!this.token) return;
    this.busy = true;
    this.receiptError = '';
    this.withAsset(this.receiptPhoto, (receipt) => {
      this.api
        .addReceipt(this.token!, { buyerName: this.buyerName, amount: Number(this.amount), receipt })
        .subscribe({
          next: () => {
            this.buyerName = '';
            this.amount = 0;
            this.receiptPhoto = null;
            this.busy = false;
            this.load();
          },
          error: () => {
            this.busy = false;
            this.receiptError = 'That receipt was not saved.';
          },
        });
    }, () => {
      this.busy = false;
      this.receiptError = 'That receipt photo was not saved.';
    });
  }

  private withAsset(file: File | null, next: (id?: number) => void, fail: () => void) {
    if (!file || !this.token) {
      next();
      return;
    }
    this.api.upload(this.token, file).subscribe({
      next: (files) => {
        const id = files[0]?.id;
        if (!id) {
          fail();
          return;
        }
        next(id);
      },
      error: () => fail(),
    });
  }

  private fileFrom(event: Event) {
    const input = event.target as HTMLInputElement;
    return input.files?.[0] ?? null;
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
    this.api.categories().subscribe({
      next: (response) => {
        this.categories = response.data ?? [];
        if (!this.category) this.category = this.categories[0]?.documentId ?? '';
      },
    });
    this.api.orders(this.token).subscribe({
      next: (response) => (this.orders = response.data ?? []),
      error: () => (this.orders = []),
    });
  }
}
