import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Product } from '../core/models';
import { HeaderComponent } from '../shell/header.component';
import { PhotoComponent } from '../shell/photo.component';

@Component({
  selector: 'app-item',
  imports: [HeaderComponent, RouterLink, DecimalPipe, PhotoComponent],
  template: `
    <app-header />
    <main class="wrap pdp">
      @if (item) {
        <app-photo kind="hero-photo" [file]="item.image" [alt]="item.name" fallback="#c45b38" />
        <section class="buybox">
          <p class="price">₦{{ item.price | number }}</p>
          <h1>{{ item.name }}</h1>
          <p class="by">{{ item.soldOut ? 'Sold out' : 'Collect at the stall' }}</p>
          @if (item.shop) {
            <a [routerLink]="['/shops', item.shop.documentId]">{{ item.shop.name }} · {{ item.shop.spot }}</a>
          }
          <p class="fine">Pay now and pay on pickup arrive with orders, after shops are listing.</p>
        </section>
      } @else {
        <p class="lead">Loading this item…</p>
      }
    </main>
  `,
})
export class ItemComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  item: Product | null = null;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.api.product(id).subscribe({
      next: (response) => (this.item = response.data),
    });
  }
}
