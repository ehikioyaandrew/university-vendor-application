import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Category, Product, University } from '../core/models';
import { HeaderComponent } from '../shell/header.component';
import { ProductCardComponent } from '../ui/product-card/product-card.component';

@Component({
  selector: 'app-market',
  imports: [HeaderComponent, ProductCardComponent],
  templateUrl: './market.component.html',
  styleUrl: './market.component.scss',
})
export class MarketComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  products: Product[] = [];
  categories: Category[] = [];
  universities: University[] = [];
  categoryId = '';
  universityId = '';
  query = '';

  constructor() {
    this.route.queryParamMap.subscribe((params) => (this.query = (params.get('q') ?? '').toLowerCase()));
    this.api.categories().subscribe({ next: (response) => (this.categories = response.data ?? []) });
    this.api.universities().subscribe({ next: (response) => (this.universities = response.data ?? []) });
    this.api.products().subscribe({
      next: (response) => (this.products = response.data ?? []),
      error: () => (this.products = []),
    });
  }

  get title() {
    return this.categories.find((category) => category.documentId === this.categoryId)?.name ?? 'Every vendor';
  }

  get shown() {
    return this.products.filter((item) => {
      const matchesCategory = !this.categoryId || item.category?.documentId === this.categoryId;
      const matchesCampus = !this.universityId || item.shop?.university?.documentId === this.universityId;
      const matchesQuery =
        !this.query ||
        `${item.name} ${item.shop?.name ?? ''} ${item.category?.name ?? ''}`.toLowerCase().includes(this.query);
      return matchesCategory && matchesCampus && matchesQuery;
    });
  }
}
