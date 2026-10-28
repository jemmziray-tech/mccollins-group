// lib/types.ts

export interface ProductItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  brand: string;
  imageUrl: string;
  hoverImageUrl?: string | null;
  category: string;
  collection?: string | null;
  department?: string;
  sizes?: string[];
  sizeType?: string;
  isAvailable?: boolean;
  stock?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  [key: string]: any;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  size?: string | null;
}

export interface CheckoutItemPayload {
  productId: string;
  quantity: number;
  size?: string | null;
}

export interface CreateOrderPayload {
  cart: {
    id: string;
    quantity: number;
    size?: string | null;
    [key: string]: any;
  }[];
  customerName?: string;
  customerPhone?: string;
}

export interface BespokeRequestPayload {
  clientName: string;
  whatsapp: string;
  productName: string;
  measurements: Record<string, any>;
  designNotes?: string | null;
}
