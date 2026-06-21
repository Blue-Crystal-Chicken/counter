export interface MenuProductResponse {
  productId: number;
  productName: string;
  quantity: number;
  obligatory: boolean;
  productimgPath: string | null;
  unitPrice: number;
}

export interface MenuResponse {
  id: number;
  name: string;
  price: number;
  description: string;
  imgPath: string | null;
  menuProducts: MenuProductResponse[];
  updatedAt: string;
}
