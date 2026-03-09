import { Timestamp } from "firebase/firestore";
import { z } from "zod";
import type { Category, Product } from "@/data/products";

const badgeSchema = z.union([z.literal("sale"), z.literal("new")]).optional();

const productSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1).default(""),
  category: z.string().trim().min(1),
  badge: badgeSchema,
  image: z.string().trim().min(1),
  originalPrice: z.coerce.number().positive().optional(),
  price: z.coerce.number().nonnegative(),
  rating: z.coerce.number().min(0).max(5),
  reviews: z.coerce.number().int().nonnegative(),
  seller: z.string().trim().min(1),
  stock: z.coerce.number().int().nonnegative(),
  created_at: z.union([z.instanceof(Timestamp), z.null(), z.undefined()]).optional(),
});

const categorySchema = z.object({
  name: z.string().trim().min(1),
  count: z.coerce.number().int().nonnegative().default(0),
  icon: z.string().trim().min(1),
});

export const parseProduct = (id: string, raw: unknown): Product | null => {
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return null;
  }

  const value = parsed.data;
  const createdAt = value.created_at instanceof Timestamp ? value.created_at.toMillis() : undefined;

  return {
    id,
    name: value.name,
    description: value.description,
    category: value.category,
    badge: value.badge,
    image: value.image,
    originalPrice: value.originalPrice,
    price: value.price,
    rating: value.rating,
    reviews: value.reviews,
    seller: value.seller,
    stock: value.stock,
    createdAt,
  };
};

export const parseCategory = (id: string, raw: unknown): Category | null => {
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return null;
  }

  const value = parsed.data;
  return {
    id,
    name: value.name,
    count: value.count,
    icon: value.icon,
  };
};
