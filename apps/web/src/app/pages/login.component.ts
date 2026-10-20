import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { ApiService } from '../core/api.service';
import { SessionService } from '../core/session.service';
import { AuthStageComponent } from '../shell/auth-stage.component';
import { FieldComponent } from '../ui/field/field.component';

@Component({
  selector: 'app-login',
  imports: [AuthStageComponent, FormsModule, RouterLink, FieldComponent, ButtonModule, InputTextModule, PasswordModule, MessageModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
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
