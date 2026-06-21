import type { MenuResponse } from './menu.types';

export interface OfferProductResponse {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  productImagePath: string;
}

export interface OfferResponse {
  id: number;
  name: string;
  description: string;
  imgPath: string | null;
  price: number;
  menus: MenuResponse[];
  offerProducts: OfferProductResponse[];
  updatedAt: string;
}
