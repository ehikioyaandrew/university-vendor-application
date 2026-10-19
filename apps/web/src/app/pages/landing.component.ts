import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Product } from '../core/models';
import { HeaderComponent } from '../shell/header.component';
import { PhotoComponent } from '../shell/photo.component';

@Component({
  selector: 'app-landing',
  imports: [HeaderComponent, RouterLink, DecimalPipe, PhotoComponent],
  template: `
    <app-header />
    <section class="hero">
      <div class="wrap">
        <h1>Every stall on campus. One market.</h1>
        <p>Food, fashion, beauty, gadgets and print from students and vendors at your university. Pay now, or collect and pay later.</p>
        <div class="hero-actions">
          <a class="btn ink" routerLink="/market">Browse the market</a>
          <a class="btn ghost" routerLink="/signup">Open your shop</a>
        </div>
      </div>
    </section>
    <main class="wrap">
      <div class="section-title">On campus now <span>{{ products.length }} items</span></div>
      <div class="grid">
        @for (item of products; track item.documentId) {
          <a class="card" [routerLink]="['/items', item.documentId]">
            <app-photo [file]="item.image" [alt]="item.name" [fallback]="hue(item.name)" />
            <div class="card-body">
              <p class="price">₦{{ item.price | number }}</p>
              <h2>{{ item.name }}</h2>
              <p class="by">{{ item.shop?.name }}</p>
            </div>
          </a>
        }
      </div>
      <div class="section-title">How a seller uses Oja</div>
      <div class="steps">
        <article class="step"><strong>1. Open a shop</strong><p>Pick your university, name the stall, and say where buyers collect.</p></article>
        <article class="step"><strong>2. Show up in the market</strong><p>Your items sit beside every other vendor. Your dashboard stays yours.</p></article>
        <article class="step"><strong>3. See the day</strong><p>What sold, what is in hand, and who still owes you. Orders come after the shop is open.</p></article>
      </div>
    </main>
  `,
})
export class LandingComponent {
  private readonly api = inject(ApiService);
  products: Product[] = [];

  constructor() {
    this.api.products().subscribe({
      next: (response) => (this.products = response.data ?? []),
      error: () => (this.products = []),
    });
  }

  hue(name: string) {
    const colors = ['#c45b38', '#1d4e89', '#6b2d5b', '#2f5d50', '#e07a3d'];
    return colors[name.length % colors.length];
  }
}
