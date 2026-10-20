import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ApiService } from '../../core/api.service';
import { assetUrl } from '../../core/media';
import { Order } from '../../core/models';
import { PageHeadingComponent } from '../../ui/page-heading/page-heading.component';
import { PersonRowComponent } from '../../ui/person-row/person-row.component';
import { StallStore } from './stall.store';

@Component({
  selector: 'app-dash-orders',
  imports: [FormsModule, ButtonModule, SelectButtonModule, PageHeadingComponent, PersonRowComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
})
export class DashOrdersComponent {
  readonly stall = inject(StallStore);
  private readonly api = inject(ApiService);
  filter: 'all' | 'cash' | 'transfer' | 'owed' = 'all';
  readonly filters = [
    { id: 'all' as const, label: 'All' },
    { id: 'cash' as const, label: 'Cash' },
    { id: 'transfer' as const, label: 'Transfer' },
    { id: 'owed' as const, label: 'Owing' },
  ];

  get visible() {
    return this.stall.orders.filter((order) => {
      if (order.status === 'cancelled') return false;
      if (this.filter === 'all') return true;
      if (this.filter === 'owed') return order.status === 'owed';
      return order.paymentMethod === this.filter;
    });
  }

  src(order: Order) {
    return assetUrl(order.receipt);
  }

  line(order: Order) {
    const amount = Number(order.amount).toLocaleString('en-NG');
    const item = order.product?.name || 'Custom sale';
    const how = order.fulfillment ? ` · ${order.fulfillment}` : '';
    return `${order.quantity || 1} × ${item} · ₦${amount}${how}`;
  }

  paySeverity(order: Order): 'success' | 'info' | 'warn' | 'secondary' {
    if (order.paymentMethod === 'cash') return 'success';
    if (order.paymentMethod === 'transfer') return 'info';
    if (order.status === 'owed') return 'warn';
    return 'secondary';
  }

  payLabel(order: Order) {
    if (order.paymentMethod === 'cash') return 'Cash';
    if (order.paymentMethod === 'transfer') return 'Transfer';
    if (order.status === 'owed') return 'Owes';
    return order.status;
  }

  settle(order: Order, paymentMethod: 'cash' | 'transfer') {
    this.save(order, { status: 'paid', paymentMethod });
  }

  tag(order: Order, paymentMethod: 'cash' | 'transfer') {
    this.save(order, { paymentMethod });
  }

  collect(order: Order) {
    this.save(order, { status: 'collected', ...(order.paymentMethod ? { paymentMethod: order.paymentMethod } : {}) });
  }

  private save(order: Order, input: { status?: Order['status']; paymentMethod?: 'cash' | 'transfer' }) {
    const token = this.stall.token;
    if (!token) return;
    this.api.settleOrder(token, order.documentId, input).subscribe({
      next: () => this.stall.refreshLive(),
    });
  }
}
