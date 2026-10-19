import { Component, Input } from '@angular/core';
import { MediaAsset, assetUrl } from '../core/media';

@Component({
  selector: 'app-photo',
  template: `
    @if (src) {
      <img [class]="kind" [src]="src" [alt]="alt" />
    } @else {
      <div [class]="kind" [style.background]="fallback">{{ label }}</div>
    }
  `,
})
export class PhotoComponent {
  @Input() file?: MediaAsset | null;
  @Input() alt = '';
  @Input() fallback = '#1d4e89';
  @Input() kind: 'photo' | 'hero-photo' | 'cover' = 'photo';

  get src() {
    return assetUrl(this.file);
  }

  get label() {
    return this.alt.split(' ')[0] || 'Oja';
  }
}
