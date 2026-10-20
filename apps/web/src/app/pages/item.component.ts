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
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss',
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
