import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ApiService } from '../core/api.service';
import { Product } from '../core/models';
import { HeaderComponent } from '../shell/header.component';
import { ProductCardComponent } from '../ui/product-card/product-card.component';

@Component({
  selector: 'app-landing',
  imports: [HeaderComponent, ButtonModule, ProductCardComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  products: Product[] = [];

  constructor() {
    this.api.products().subscribe({
      next: (response) => (this.products = response.data ?? []),
      error: () => (this.products = []),
    });
  }

  open(path: string) {
    this.router.navigateByUrl(path);
  }
}
