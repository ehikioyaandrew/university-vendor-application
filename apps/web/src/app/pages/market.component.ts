import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Category, Product } from '../core/models';
import { HeaderComponent } from '../shell/header.component';
import { PhotoComponent } from '../shell/photo.component';

@Component({
  selector: 'app-market',
  imports: [HeaderComponent, RouterLink, DecimalPipe, PhotoComponent],
  template: `
    <app-header />
    <main class="wrap">
      <div class="chips">
        <button type="button" [class.on]="!categoryId" (click)="categoryId = ''">All</button>
        @for (category of categories; track category.documentId) {
          <button type="button" [class.on]="categoryId === category.documentId" (click)="categoryId = category.documentId">
            {{ category.name }}
          </button>
        }
      </div>
      <div class="section-title">Every vendor <span>{{ shown.length }} items</span></div>
      <div class="grid">
        @for (item of shown; track item.documentId) {
          <a class="card" [routerLink]="['/items', item.documentId]">
            <app-photo [file]="item.image" [alt]="item.name" />
            <div class="card-body">
              <p class="price">₦{{ item.price | number }}</p>
              <h2>{{ item.name }}</h2>
              <p class="by">{{ item.shop?.name }}@if (item.category) { · {{ item.category.name }} }</p>
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
  categories: Category[] = [];
  categoryId = '';
  query = '';

  constructor() {
    this.route.queryParamMap.subscribe((params) => (this.query = (params.get('q') ?? '').toLowerCase()));
    this.api.categories().subscribe({
      next: (response) => (this.categories = response.data ?? []),
    });
    this.api.products().subscribe({
      next: (response) => (this.products = response.data ?? []),
      error: () => (this.products = []),
    });
  }

  get shown() {
    return this.products.filter((item) => {
      const matchesCategory = !this.categoryId || item.category?.documentId === this.categoryId;
      const matchesQuery =
        !this.query || `${item.name} ${item.shop?.name ?? ''} ${item.category?.name ?? ''}`.toLowerCase().includes(this.query);
      return matchesCategory && matchesQuery;
    });
  }
}
