import { MediaAsset } from './media';

export interface University {
  documentId: string;
  name: string;
  slug: string;
}

export interface Shop {
  documentId: string;
  name: string;
  slug?: string;
  spot: string;
  cover?: MediaAsset | null;
  university?: University | null;
  products?: Product[];
}

export interface Category {
  documentId: string;
  name: string;
  slug: string;
}

export interface Product {
  documentId: string;
  name: string;
  price: number;
  soldOut: boolean;
  image?: MediaAsset | null;
  category?: Category | null;
  shop?: Shop | null;
}

export interface Address {
  documentId: string;
  label: string;
  line: string;
  area?: string;
  phone: string;
}

export interface Order {
  documentId: string;
  buyerName: string;
  amount: number;
  status: 'owed' | 'paid' | 'collected' | 'cancelled';
  fulfillment?: 'pickup' | 'delivery';
  note?: string;
  receipt?: MediaAsset | null;
  product?: Product | null;
  shop?: Shop | null;
  address?: Address | null;
}

export interface Review {
  documentId: string;
  stars: number;
  comment: string;
  shop?: Shop | null;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  phone?: string;
  displayName?: string;
}

export interface AuthResponse {
  jwt: string;
  user: AuthUser;
}

export interface ListResponse<T> {
  data: T[];
}
