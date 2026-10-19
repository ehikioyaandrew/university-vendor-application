import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Product } from '../core/models';
import { HeaderComponent } from '../shell/header.component';
import { PhotoComponent } from '../shell/photo.component';

@Component({
  selector: 'app-market',
  imports: [HeaderComponent, RouterLink, DecimalPipe, PhotoComponent],
  template: `
    <app-header />
    <main class="wrap">
      <div class="section-title">Every vendor <span>{{ shown.length }} items</span></div>
      <div class="grid">
        @for (item of shown; track item.documentId) {
          <a class="card" [routerLink]="['/items', item.documentId]">
            <app-photo [file]="item.image" [alt]="item.name" />
            <div class="card-body">
              <p class="price">₦{{ item.price | number }}</p>
              <h2>{{ item.name }}</h2>
              <p class="by">{{ item.shop?.name }}</p>
            </div>
          </a>
        } @empty {
          <p class="lead">No items yet. Open a shop and add the first one.</p>
        }
      </div>
    </main>
  `,
})
export class MarketComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  products: Product[] = [];
  query = '';

  constructor() {
    this.route.queryParamMap.subscribe((params) => (this.query = (params.get('q') ?? '').toLowerCase()));
    this.api.products().subscribe({
      next: (response) => (this.products = response.data ?? []),
      error: () => (this.products = []),
    });
  }

  get shown() {
    if (!this.query) return this.products;
    return this.products.filter((item) =>
      `${item.name} ${item.shop?.name ?? ''}`.toLowerCase().includes(this.query),
    );
  }
}
