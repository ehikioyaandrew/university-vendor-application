import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ApiService } from '../../core/api.service';
import { PhotoComponent } from '../../shell/photo.component';
import { FieldComponent } from '../../ui/field/field.component';
import { PageHeadingComponent } from '../../ui/page-heading/page-heading.component';
import { StallStore } from './stall.store';

@Component({
  selector: 'app-dash-shop',
  imports: [FormsModule, ButtonModule, MessageModule, PhotoComponent, FieldComponent, PageHeadingComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class DashShopComponent {
  readonly stall = inject(StallStore);
  private readonly api = inject(ApiService);
  error = '';
  busy = false;
  private photo: File | null = null;

  pick(event: Event) {
    const input = event.target as HTMLInputElement;
    this.photo = input.files?.[0] ?? null;
  }

  save() {
    const token = this.stall.token;
    const shop = this.stall.shop;
    if (!token || !shop) return;
    if (!this.photo) {
      this.error = 'Choose a shop photo first.';
      return;
    }
    this.busy = true;
    this.error = '';
    this.api.upload(token, this.photo).subscribe({
      next: (files) => {
        const id = files[0]?.id;
        if (!id) {
          this.busy = false;
          this.error = 'That shop photo was not saved.';
          return;
        }
        this.api.updateShopCover(token, shop.documentId, id).subscribe({
          next: () => {
            this.photo = null;
            this.busy = false;
            this.stall.load();
          },
          error: () => {
            this.busy = false;
            this.error = 'That shop photo was not saved.';
          },
        });
      },
      error: () => {
        this.busy = false;
        this.error = 'That shop photo was not saved.';
      },
    });
  }
}
