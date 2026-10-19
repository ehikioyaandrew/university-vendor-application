import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { SessionService } from '../core/session.service';
import { University } from '../core/models';
import { AuthStageComponent } from '../shell/auth-stage.component';

@Component({
  selector: 'app-signup',
  imports: [AuthStageComponent, FormsModule, RouterLink],
  template: `
    <app-auth-stage>
      <form class="form" (ngSubmit)="submit()">
        <p class="gate-kicker" style="color:var(--ink);background:#fff1e6">New stall</p>
        <h1>Open your shop.</h1>
        <p class="lead">Share one link on your status. The rest of campus can find the stall.</p>
        <label>University
          <select name="university" [(ngModel)]="university" required>
            @for (item of universities; track item.documentId) {
              <option [value]="item.documentId">{{ item.name }}</option>
            }
          </select>
        </label>
        <label>Your name <input name="name" [(ngModel)]="name" required /></label>
        <label>Phone <input name="phone" [(ngModel)]="phone" required /></label>
        <label>Password <input name="password" type="password" [(ngModel)]="password" minlength="6" required /></label>
        <label>Shop name <input name="shop" [(ngModel)]="shop" required /></label>
        <label>Where buyers collect <input name="spot" [(ngModel)]="spot" required /></label>
        @if (error) { <p class="error">{{ error }}</p> }
        <button class="btn orange block" type="submit" [disabled]="busy">Create my shop</button>
        <p class="fine">Already selling? <a routerLink="/login">Log in</a></p>
      </form>
    </app-auth-stage>
  `,
})
export class SignupComponent {
  private readonly api = inject(ApiService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  universities: University[] = [];
  university = '';
  name = '';
  phone = '';
  password = '';
  shop = '';
  spot = '';
  error = '';
  busy = false;

  constructor() {
    this.api.universities().subscribe({
      next: (response) => {
        this.universities = response.data ?? [];
        this.university = this.universities[0]?.documentId ?? '';
      },
      error: () => (this.error = 'The market API is not running yet.'),
    });
  }

  submit() {
    this.error = '';
    this.busy = true;
    this.api.register({ phone: this.phone, password: this.password, name: this.name }).subscribe({
      next: (auth) => {
        this.session.save(auth.jwt, auth.user);
        this.api
          .openShop(auth.jwt, { name: this.shop, spot: this.spot, university: this.university })
          .subscribe({
            next: () => this.router.navigateByUrl('/dashboard'),
            error: (err) => {
              this.busy = false;
              this.error = err?.error?.error?.message ?? 'The account was created, but the shop was not.';
            },
          });
      },
      error: (err) => {
        this.busy = false;
        this.error = err?.error?.error?.message ?? 'Sign up failed. Use a phone number that is not already on Oja.';
      },
    });
  }
}
