import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { SessionService } from '../core/session.service';
import { HeaderComponent } from '../shell/header.component';

@Component({
  selector: 'app-login',
  imports: [HeaderComponent, FormsModule, RouterLink],
  template: `
    <app-header />
    <main class="wrap auth">
      <div>
        <h1>Welcome back.</h1>
        <p class="lead">Your dashboard, your items, and later the people who still owe you.</p>
      </div>
      <form class="form" (ngSubmit)="submit()">
        <label>Phone <input name="phone" [(ngModel)]="phone" required /></label>
        <label>Password <input name="password" type="password" [(ngModel)]="password" required /></label>
        @if (error) { <p class="error">{{ error }}</p> }
        <button class="btn orange block" type="submit">Log in</button>
        <p class="fine">New stall? <a routerLink="/signup">Sign up</a></p>
      </form>
    </main>
  `,
})
export class LoginComponent {
  private readonly api = inject(ApiService);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  phone = '';
  password = '';
  error = '';

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
