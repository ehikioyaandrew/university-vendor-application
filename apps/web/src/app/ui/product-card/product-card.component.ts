import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models';
import { PhotoComponent } from '../../shell/photo.component';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, DecimalPipe, PhotoComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Input() showShop = true;
  @Input() showCategory = false;
}
