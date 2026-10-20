import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SessionService } from '../core/session.service';
import { AvatarComponent } from './avatar.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, FormsModule, AvatarComponent, ButtonModule, InputTextModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  protected readonly session = inject(SessionService);
  private readonly router = inject(Router);
  query = '';

  get name() {
    const user = this.session.user();
    return user?.displayName || user?.username || 'Oja';
  }

  search() {
    this.router.navigate(['/market'], { queryParams: { q: this.query } });
  }

  go(path: string) {
    this.router.navigateByUrl(path);
  }

  logout() {
    this.session.clear();
    this.router.navigateByUrl('/');
  }
}
