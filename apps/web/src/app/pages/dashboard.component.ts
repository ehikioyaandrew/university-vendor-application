import { Component, DestroyRef, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { HeaderComponent } from '../shell/header.component';
import { StallStore } from './dash/stall.store';

@Component({
  selector: 'app-dashboard',
  imports: [HeaderComponent, RouterLink, RouterLinkActive, RouterOutlet, ButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  readonly stall = inject(StallStore);
  private readonly router = inject(Router);

  constructor() {
    if (!this.stall.token) return;
    this.stall.load();
    const timer = setInterval(() => this.stall.refreshLive(), 8000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  openLogin() {
    this.router.navigateByUrl('/login');
  }
}
