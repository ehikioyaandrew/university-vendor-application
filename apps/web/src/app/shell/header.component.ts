import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SessionService } from '../core/session.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, FormsModule],
  template: `
    <header class="site-header">
      <div class="wrap">
        <a class="logo" routerLink="/">Oja</a>
        <form class="searchbar" (ngSubmit)="search()">
          <input name="q" [(ngModel)]="query" placeholder="Search food, wigs, chargers, binding" />
          <button type="submit">Search</button>
        </form>
        <div class="header-actions">
          @if (session.token()) {
            <a routerLink="/dashboard">Dashboard</a>
            <button class="btn ghost" type="button" (click)="logout()">Log out</button>
          } @else {
            <a class="ghost" routerLink="/login">Log in</a>
            <a class="orange" routerLink="/signup">Sign up</a>
          }
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);
  query = '';

  search() {
    this.router.navigate(['/market'], { queryParams: { q: this.query } });
  }

  logout() {
    this.session.clear();
    this.router.navigateByUrl('/');
  }
}
