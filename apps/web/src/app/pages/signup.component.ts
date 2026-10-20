import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ApiService } from '../core/api.service';
import { SessionService } from '../core/session.service';
import { University } from '../core/models';
import { AuthStageComponent } from '../shell/auth-stage.component';
import { FieldComponent } from '../ui/field/field.component';

@Component({
  selector: 'app-signup',
  imports: [AuthStageComponent, FormsModule, RouterLink, FieldComponent, ButtonModule, InputTextModule, PasswordModule, SelectModule, MessageModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
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
        this.api.openShop(auth.jwt, { name: this.shop, spot: this.spot, university: this.university }).subscribe({
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
