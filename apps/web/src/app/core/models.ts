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
  university?: University | null;
  products?: Product[];
}

export interface Product {
  documentId: string;
  name: string;
  price: number;
  soldOut: boolean;
  shop?: Shop | null;
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
