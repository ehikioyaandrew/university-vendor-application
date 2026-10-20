import { Component, Input } from '@angular/core';

const paints = [
  { bg: '#ff6a00', skin: '#ffd8b8', hair: '#3a2416', accent: '#1a1a1a' },
  { bg: '#7c3aed', skin: '#f3c7a1', hair: '#1f130c', accent: '#fde68a' },
  { bg: '#0f766e', skin: '#e8b892', hair: '#2b1810', accent: '#99f6e4' },
  { bg: '#e11d48', skin: '#ffd0aa', hair: '#4a2912', accent: '#ffe4e6' },
  { bg: '#1d4e89', skin: '#f1c7a0', hair: '#24150d', accent: '#bfdbfe' },
  { bg: '#c2410c', skin: '#ffcba4', hair: '#111111', accent: '#ffedd5' },
];

export function avatarPaint(name: string) {
  let hash = 0;
  for (const char of name || 'Oja') hash = (hash + char.charCodeAt(0) * 17) % 997;
  return { ...paints[hash % paints.length], style: hash % 4 };
}

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  @Input() name = 'Oja';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get paint() {
    return avatarPaint(this.name);
  }
}
