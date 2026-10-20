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
  quantity?: number;
  status: 'owed' | 'paid' | 'collected' | 'cancelled';
  paymentMethod?: 'cash' | 'transfer' | null;
  paidAt?: string | null;
  createdAt?: string;
  fulfillment?: 'pickup' | 'delivery';
  note?: string;
  receipt?: MediaAsset | null;
  product?: Product | null;
  shop?: Shop | null;
  address?: Address | null;
}

export type SalesRange = 'day' | 'week' | 'month';

export interface SaleLine {
  at: string;
  buyerName: string;
  item: string;
  quantity: number;
  amount: number;
  paymentMethod: 'cash' | 'transfer' | null;
  status: string;
}

export interface SoldItem {
  name: string;
  quantity: number;
  amount: number;
}

export interface SalesBook {
  range: SalesRange;
  label: string;
  span: string;
  from: string;
  asOf: string;
  made: number;
  cash: number;
  transfer: number;
  unmarked: number;
  owing: number;
  salesCount: number;
  items: SoldItem[];
  sales: SaleLine[];
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
