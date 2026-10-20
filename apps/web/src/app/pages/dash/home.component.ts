import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { interval } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { SalesRange } from '../../core/models';
import { AvatarComponent } from '../../shell/avatar.component';
import { PhotoComponent } from '../../shell/photo.component';
import { FieldComponent } from '../../ui/field/field.component';
import { PayStatComponent } from '../../ui/pay-stat/pay-stat.component';
import { PersonRowComponent } from '../../ui/person-row/person-row.component';
import { downloadExcel, downloadPdf } from './export-book';
import { StallStore } from './stall.store';

@Component({
  selector: 'app-dash-home',
  imports: [
    FormsModule,
    DecimalPipe,
    AvatarComponent,
    PhotoComponent,
    FieldComponent,
    PayStatComponent,
    PersonRowComponent,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    SelectButtonModule,
    MessageModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class DashHomeComponent {
  readonly stall = inject(StallStore);
  private readonly api = inject(ApiService);
  readonly ranges: { id: SalesRange; label: string }[] = [
    { id: 'day', label: 'Today' },
    { id: 'week', label: 'This week' },
    { id: 'month', label: 'This month' },
  ];
  readonly pays = [
    { id: 'cash' as const, label: 'Cash' },
    { id: 'transfer' as const, label: 'Transfer' },
    { id: 'owe' as const, label: 'Owes me' },
  ];
  buyerName = '';
  productId = '';
  quantity = 1;
  amount = 0;
  pay: 'cash' | 'transfer' | 'owe' = 'cash';
  error = '';
  busy = false;
  bump = false;
  now = Date.now();
  private photo: File | null = null;
  private made = -1;

  constructor() {
    const destroyRef = inject(DestroyRef);
    interval(1000)
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(() => {
        this.now = Date.now();
        const made = this.stall.book?.made ?? -1;
        if (this.made >= 0 && made !== this.made) {
          this.bump = true;
          setTimeout(() => (this.bump = false), 500);
        }
        this.made = made;
      });
  }

  get chosen() {
    return this.stall.shop?.products?.find((item) => item.documentId === this.productId);
  }

  get itemOptions() {
    return [
      { label: 'Custom amount', value: '' },
      ...(this.stall.shop?.products ?? []).map((item) => ({
        label: `${item.name} · ₦${item.price.toLocaleString('en-NG')}`,
        value: item.documentId,
      })),
    ];
  }

  get quote() {
    const qty = Math.max(1, Number(this.quantity) || 1);
    if (this.chosen) return this.chosen.price * qty;
    return Math.max(0, Number(this.amount) || 0);
  }

  get preview() {
    const figure = `₦${this.quote.toLocaleString('en-NG')}`;
    if (this.pay === 'owe') return `${figure} stays on Still owing until they pay.`;
    return `${figure} lands on Made now, tagged ${this.pay}.`;
  }

  get fresh() {
    if (!this.stall.book) return 'Live';
    const seconds = Math.max(0, Math.round((this.now - Date.parse(this.stall.book.asOf)) / 1000));
    if (seconds < 8) return 'Live · just updated';
    return `Live · updated ${seconds}s ago`;
  }

  paySeverity(method: 'cash' | 'transfer' | null, status: string): 'success' | 'info' | 'warn' | 'secondary' {
    if (method === 'cash') return 'success';
    if (method === 'transfer') return 'info';
    if (status === 'owed') return 'warn';
    return 'secondary';
  }

  payLabel(method: 'cash' | 'transfer' | null, status: string) {
    if (method === 'cash') return 'Cash';
    if (method === 'transfer') return 'Transfer';
    if (status === 'owed') return 'Owes';
    return status;
  }

  pick(event: Event) {
    const input = event.target as HTMLInputElement;
    this.photo = input.files?.[0] ?? null;
  }

  excel() {
    if (this.stall.shop && this.stall.book) downloadExcel(this.stall.shop.name, this.stall.book);
  }

  pdf() {
    if (this.stall.shop && this.stall.book) downloadPdf(this.stall.shop.name, this.stall.book);
  }

  save() {
    const token = this.stall.token;
    if (!token) return;
    this.busy = true;
    this.error = '';
    const send = (receipt?: number) => {
      this.api
        .recordSale(token, {
          buyerName: this.buyerName,
          quantity: Math.max(1, Number(this.quantity) || 1),
          ...(this.productId ? { product: this.productId } : { amount: Math.max(0, Number(this.amount) || 0) }),
          ...(this.pay === 'owe' ? {} : { paymentMethod: this.pay }),
          ...(receipt ? { receipt } : {}),
        })
        .subscribe({
          next: () => {
            this.buyerName = '';
            this.productId = '';
            this.quantity = 1;
            this.amount = 0;
            this.photo = null;
            this.busy = false;
            this.stall.refreshLive();
          },
          error: (err) => {
            this.busy = false;
            this.error = err?.error?.error?.message || 'That sale was not saved.';
          },
        });
    };
    if (!this.photo) {
      send();
      return;
    }
    this.api.upload(token, this.photo).subscribe({
      next: (files) => (files[0]?.id ? send(files[0].id) : ((this.busy = false), (this.error = 'That receipt photo was not saved.'))),
      error: () => {
        this.busy = false;
        this.error = 'That receipt photo was not saved.';
      },
    });
  }
}
