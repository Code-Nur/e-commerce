export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  badge?: "sale" | "new";
  description: string;
  stock: number;
  seller: string;
  createdAt?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
};
