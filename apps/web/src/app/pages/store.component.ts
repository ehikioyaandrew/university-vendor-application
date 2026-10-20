import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Shop } from '../core/models';
import { HeaderComponent } from '../shell/header.component';
import { PhotoComponent } from '../shell/photo.component';
import { ProductCardComponent } from '../ui/product-card/product-card.component';

@Component({
  selector: 'app-store',
  imports: [HeaderComponent, PhotoComponent, ProductCardComponent],
  templateUrl: './store.component.html',
  styleUrl: './store.component.scss',
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
