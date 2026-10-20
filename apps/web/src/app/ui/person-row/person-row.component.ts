import { Component, Input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { AvatarComponent } from '../../shell/avatar.component';

@Component({
  selector: 'app-person-row',
  imports: [AvatarComponent, TagModule],
  templateUrl: './person-row.component.html',
  styleUrl: './person-row.component.scss',
})
export class PersonRowComponent {
  @Input() name = 'Oja';
  @Input() title = '';
  @Input() detail = '';
  @Input() tag = '';
  @Input() severity: 'success' | 'info' | 'warn' | 'secondary' = 'secondary';
  @Input() aside = '';
}
