export interface OrderItemRequest {
  productId: number | null;
  offerId: number | null;
  menuId: number | null;
  quantity: number;
  specialNote: string | null;
  ingredientIds: number[] | null;
}

export interface OrderRequest {
  userId: number | null;
  items: OrderItemRequest[];
  paymentType: string;
  serviceType: string;
  orderType: string;
  tableNumber: string | null;
  locationId: number | null;
  locationName: string | null;
  locationAddress: string | null;
  locationCity: string | null;
}

export interface OrderItemResponse {
  productId: number;
  productName: string;
  offerId: number | null;
  offerName: string | null;
  quantity: number;
  price: number;
  additions: number;
  specialNote: string | null;
}

export interface OrderResponse {
  id: number;
  orderId: string;
  code: string;
  serviceType: string;
  orderType: string;
  tableNumber: string | null;
  paymentType: string;
  paymentAmount: number;
  totalAt: number;
  status: string;
  userId: number | null;
  userName: string | null;
  locationId: number | null;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}
