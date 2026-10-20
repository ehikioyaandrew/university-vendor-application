import { Component, Input } from '@angular/core';
import { MediaAsset, assetUrl } from '../core/media';
import { AvatarComponent, avatarPaint } from './avatar.component';

@Component({
  selector: 'app-photo',
  imports: [AvatarComponent],
  templateUrl: './photo.component.html',
  styleUrl: './photo.component.scss',
})
export class PhotoComponent {
  @Input() file?: MediaAsset | null;
  @Input() alt = '';
  @Input() kind: 'photo' | 'hero-photo' | 'cover' = 'photo';
  useAvatar = false;

  get src() {
    return assetUrl(this.file);
  }

  get paint() {
    return avatarPaint(this.alt || 'Oja');
  }

  measure(event: Event) {
    const image = event.target as HTMLImageElement;
    if (image.naturalWidth < 8) this.useAvatar = true;
  }
}
