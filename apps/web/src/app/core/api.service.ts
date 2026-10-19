import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MediaAsset } from './media';
import { AuthResponse, ListResponse, Order, Product, Shop, University } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  universities() {
    return this.http.get<ListResponse<University>>(`${this.base}/api/universities`);
  }

  products() {
    return this.http.get<ListResponse<Product>>(
      `${this.base}/api/products?populate[shop]=true&populate[image]=true`,
    );
  }

  product(documentId: string) {
    return this.http.get<{ data: Product }>(
      `${this.base}/api/products/${documentId}?populate[image]=true&populate[shop][populate]=university`,
    );
  }

  shop(documentId: string) {
    return this.http.get<{ data: Shop }>(
      `${this.base}/api/shops/${documentId}?populate[cover]=true&populate[university]=true&populate[products][populate][image]=true`,
    );
  }

  register(input: { phone: string; password: string; name: string }) {
    const digits = input.phone.replace(/\D/g, '');
    return this.http.post<AuthResponse>(`${this.base}/api/auth/local/register`, {
      username: `oja${digits}`,
      email: `${digits}@sellers.oja.local`,
      password: input.password,
    });
  }

  login(input: { phone: string; password: string }) {
    const digits = input.phone.replace(/\D/g, '');
    return this.http.post<AuthResponse>(`${this.base}/api/auth/local`, {
      identifier: `${digits}@sellers.oja.local`,
      password: input.password,
    });
  }

  openShop(token: string, input: { name: string; spot: string; university: string }) {
    return this.http.post<{ data: Shop }>(
      `${this.base}/api/shops`,
      { data: input },
      { headers: this.auth(token) },
    );
  }

  myShop(token: string) {
    return this.http.get<{ data: Shop | null }>(`${this.base}/api/shops/mine`, {
      headers: this.auth(token),
    });
  }

  addProduct(token: string, input: { name: string; price: number; image?: number }) {
    return this.http.post(`${this.base}/api/products`, { data: input }, { headers: this.auth(token) });
  }

  updateShopCover(token: string, shopId: string, cover: number) {
    return this.http.put<{ data: Shop }>(
      `${this.base}/api/shops/${shopId}`,
      { data: { cover } },
      { headers: this.auth(token) },
    );
  }

  upload(token: string, file: File) {
    const body = new FormData();
    body.append('files', file);
    return this.http.post<MediaAsset[]>(`${this.base}/api/upload`, body, { headers: this.auth(token) });
  }

  orders(token: string) {
    return this.http.get<ListResponse<Order>>(`${this.base}/api/orders`, { headers: this.auth(token) });
  }

  addReceipt(token: string, input: { buyerName: string; amount: number; receipt?: number }) {
    return this.http.post<{ data: Order }>(
      `${this.base}/api/orders`,
      { data: input },
      { headers: this.auth(token) },
    );
  }

  private auth(token: string) {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
