import { environment } from '../../environments/environment';

export interface MediaAsset {
  id?: number;
  documentId?: string;
  url?: string;
  alternativeText?: string | null;
  name?: string;
}

export function assetUrl(file?: MediaAsset | null): string | null {
  const url = file?.url;
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${environment.apiUrl}${url}`;
}
