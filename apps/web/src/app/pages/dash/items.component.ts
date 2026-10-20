import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { FieldComponent } from '../../ui/field/field.component';
import { PageHeadingComponent } from '../../ui/page-heading/page-heading.component';
import { ProductCardComponent } from '../../ui/product-card/product-card.component';
import { ApiService } from '../../core/api.service';
import { StallStore } from './stall.store';

@Component({
  selector: 'app-dash-items',
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    MessageModule,
    FieldComponent,
    PageHeadingComponent,
    ProductCardComponent,
  ],
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss',
})
export class DashItemsComponent {
  readonly stall = inject(StallStore);
  private readonly api = inject(ApiService);
  itemName = '';
  price = 0;
  category = '';
  error = '';
  busy = false;
  private photo: File | null = null;

  constructor() {
    if (!this.category && this.stall.categories[0]) this.category = this.stall.categories[0].documentId;
  }

  pick(event: Event) {
    const input = event.target as HTMLInputElement;
    this.photo = input.files?.[0] ?? null;
  }

  add() {
    const token = this.stall.token;
    if (!token) return;
    if (!this.category) this.category = this.stall.categories[0]?.documentId ?? '';
    this.busy = true;
    this.error = '';
    const save = (image?: number) => {
      this.api.addProduct(token, { name: this.itemName, price: Number(this.price), category: this.category, image }).subscribe({
        next: () => {
          this.itemName = '';
          this.price = 0;
          this.photo = null;
          this.busy = false;
          this.stall.load();
        },
        error: () => {
          this.busy = false;
          this.error = 'That item was not saved.';
        },
      });
    };
    if (!this.photo) {
      save();
      return;
    }
    this.api.upload(token, this.photo).subscribe({
      next: (files) => (files[0]?.id ? save(files[0].id) : ((this.busy = false), (this.error = 'That photo was not saved.'))),
      error: () => {
        this.busy = false;
        this.error = 'That photo was not saved.';
      },
    });
  }
}
