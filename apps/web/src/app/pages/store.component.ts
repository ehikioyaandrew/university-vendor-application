import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Shop } from '../core/models';
import { HeaderComponent } from '../shell/header.component';

@Component({
  selector: 'app-store',
  imports: [HeaderComponent, RouterLink, DecimalPipe],
  template: `
    <app-header />
    <main class="wrap">
      @if (shop) {
        <header class="dash-hero">
          <p>{{ shop.university?.name }}</p>
          <h1>{{ shop.name }}</h1>
          <p>{{ shop.spot }}</p>
        </header>
        <div class="section-title">From this stall</div>
        <div class="grid">
          @for (item of shop.products ?? []; track item.documentId) {
            <a class="card" [routerLink]="['/items', item.documentId]">
              <div class="photo" style="background:#243038">{{ item.name.split(' ')[0] }}</div>
              <div class="card-body">
                <p class="price">₦{{ item.price | number }}</p>
                <h2>{{ item.name }}</h2>
              </div>
            </a>
          } @empty {
            <p class="lead">This stall has not listed an item yet.</p>
          }
        </div>
      }
    </main>
  `,
})
export class StoreComponent {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  shop: Shop | null = null;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.api.shop(id).subscribe({ next: (response) => (this.shop = response.data) });
  }
}
