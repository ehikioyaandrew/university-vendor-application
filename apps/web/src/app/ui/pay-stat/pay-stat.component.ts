import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-pay-stat',
  imports: [DecimalPipe],
  templateUrl: './pay-stat.component.html',
  styleUrl: './pay-stat.component.scss',
})
export class PayStatComponent {
  @Input() label = '';
  @Input() amount = 0;
  @Input() tone: 'cash' | 'transfer' | 'owing' = 'cash';
}
