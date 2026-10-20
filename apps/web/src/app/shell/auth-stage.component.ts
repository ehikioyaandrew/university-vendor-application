import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Category, Product } from '../core/models';

@Component({
  selector: 'app-auth-stage',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './auth-stage.component.html',
  styleUrl: './auth-stage.component.scss',
})
export class AuthStageComponent {
  private readonly api = inject(ApiService);
  tickets: Product[] = [];
  categories: Category[] = [];

  constructor() {
    this.api.products().subscribe({
      next: (response) => (this.tickets = (response.data ?? []).slice(0, 4)),
    });
    this.api.categories().subscribe({
      next: (response) => (this.categories = response.data ?? []),
    });
  }

  get line() {
    const names = this.categories.map((category) => category.name);
    if (!names.length) return 'The market your group chat already knows.';
    return `${names.join(', ')}. The market your group chat already knows.`;
  }

  get loop() {
    const names = this.categories.map((category) => category.name);
    return [...names, ...names];
  }
}
