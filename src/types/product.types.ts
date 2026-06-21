import type { CategoryResponse } from "./category.types";

export interface IngredientResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export interface ProductResponse {
  id: number;
  name: string;
  category: CategoryResponse;
  description: string;
  size: string | null;
  quantity: number | null;
  weight: number | null;
  liters: number | null;
  isSpicy: boolean | null;
  flavor: string | null;
  temperature: string | null;
  isCarbonated: boolean | null;
  calories: number | null;
  isVegetarian: boolean | null;
  isVegan: boolean | null;
  isGlutenFree: boolean | null;
  additions: number | null;
  price: number;
  imgPath: string | null;
  ingredients: IngredientResponse[];
  updatedAt: string;
}
