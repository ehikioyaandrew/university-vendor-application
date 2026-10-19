import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { SessionService } from '../core/session.service';
import { AuthStageComponent } from '../shell/auth-stage.component';

@Component({
  selector: 'app-login',
  imports: [AuthStageComponent, FormsModule, RouterLink],
  template: `
    <app-auth-stage>
      <form class="form" (ngSubmit)="submit()">
        <p class="gate-kicker" style="color:var(--ink);background:#fff1e6">Seller door</p>
        <h1>Welcome back.</h1>
        <p class="lead">Your stall is still on the market. Jump in and see who is waiting.</p>
        <label>Phone <input name="phone" [(ngModel)]="phone" inputmode="tel" autocomplete="username" placeholder="080…" required /></label>
        <label>Password
          <input name="password" [type]="show ? 'text' : 'password'" [(ngModel)]="password" autocomplete="current-password" required />
        </label>
        <button class="peek" type="button" (click)="show = !show">{{ show ? 'Hide password' : 'Show password' }}</button>
        @if (error) { <p class="error">{{ error }}</p> }
        <button class="btn orange block" type="submit">Enter Oja</button>
        <p class="fine">New stall? <a routerLink="/signup">Open one</a></p>
      </form>
    </app-auth-stage>
  `,
})
export class LoginComponent {
  private readonly api = inject(ApiService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  phone = '';
  password = '';
  error = '';
  show = false;

  submit() {
    this.api.login({ phone: this.phone, password: this.password }).subscribe({
      next: (auth) => {
        this.session.save(auth.jwt, auth.user);
        this.router.navigateByUrl('/dashboard');
      },
      error: () => (this.error = 'That phone and password did not match a shop.'),
    });
  }
}
