import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Category, Product } from '../core/models';

@Component({
  selector: 'app-auth-stage',
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="gate">
      <aside class="gate-stage" aria-hidden="true">
        <div class="gate-glow"></div>
        <p class="gate-kicker"><span class="live"></span> Campus is live</p>
        <h2>Every stall.<br />One status link.</h2>
        <p class="gate-line">{{ line }}</p>
        <div class="floaters">
          @for (item of tickets; track item.documentId) {
            <article class="ticket">
              <span>₦{{ item.price | number }}</span>
              <strong>{{ item.name }}</strong>
              <em>{{ item.shop?.university?.name || item.shop?.spot || item.shop?.name }}</em>
            </article>
          }
        </div>
        @if (loop.length) {
          <div class="marquee">
            <div class="marquee-track">
              @for (name of loop; track $index) {
                <span>{{ name }}</span>
              }
            </div>
          </div>
        }
      </aside>
      <section class="gate-panel">
        <div class="gate-top">
          <a class="logo" routerLink="/">Oja</a>
          <a class="gate-browse" routerLink="/market">Browse the market</a>
        </div>
        <div class="gate-card">
          <ng-content />
        </div>
      </section>
    </div>
  `,
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
