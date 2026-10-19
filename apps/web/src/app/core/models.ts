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

export interface Product {
  documentId: string;
  name: string;
  price: number;
  soldOut: boolean;
  image?: MediaAsset | null;
  shop?: Shop | null;
}

export interface Order {
  documentId: string;
  buyerName: string;
  amount: number;
  status: 'owed' | 'paid' | 'collected' | 'cancelled';
  receipt?: MediaAsset | null;
  product?: Product | null;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  phone?: string;
}

export interface AuthResponse {
  jwt: string;
  user: AuthUser;
}

export interface ListResponse<T> {
  data: T[];
}
