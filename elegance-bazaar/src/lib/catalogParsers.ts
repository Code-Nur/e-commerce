import { Timestamp } from "firebase/firestore";
import { z } from "zod";
import type { Category, Product } from "@/data/products";

const badgeSchema = z.union([z.literal("sale"), z.literal("new")]).optional();

const productSchema = z.object({
  name: z.string().trim().min(0).default("Nomsiz mahsulot"),
  description: z.string().trim().default(""),
  category: z.string().trim().min(0).default("boshqa"),
  badge: badgeSchema,
  image: z.string().trim().default("https://nftcalendar.io/storage/uploads/2022/02/21/image-not-found_0221202211372462137974b6c1a.png"),
  originalPrice: z.coerce.number().positive().optional(),
  price: z.coerce.number().nonnegative().default(0),
  rating: z.coerce.number().min(0).max(5).default(0),
  reviews: z.coerce.number().int().nonnegative().default(0),
  seller: z.string().trim().default("Noma'lum sotuvchi"),
  stock: z.coerce.number().int().nonnegative().default(0),
  created_at: z.union([z.instanceof(Timestamp), z.number(), z.null(), z.undefined()]).optional(),
});

const categorySchema = z.object({
  name: z.string().trim().min(0).default("Nomsiz kategoriya"),
  icon: z.string().trim().default("LayoutGrid"),
});

export const parseProduct = (id: string, raw: unknown): Product | null => {
  // Use safeParse and always return something if raw is an object
  const parsed = productSchema.safeParse(raw || {});
  
  const value = parsed.success 
    ? parsed.data 
    : productSchema.parse({}); // Fallback to all defaults

  let createdAt: number | undefined;
  if (value.created_at instanceof Timestamp) {
    createdAt = value.created_at.toMillis();
  } else if (typeof value.created_at === "number") {
    createdAt = value.created_at;
  }

  const rawName = (raw as any)?.name;
  const name = typeof rawName === "string" && rawName.trim().length > 0 
    ? rawName.trim() 
    : value.name;

  return {
    id,
    name,
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
  const parsed = categorySchema.safeParse(raw || {});
  const value = parsed.success ? parsed.data : categorySchema.parse({});

  return {
    id,
    name: value.name,
    icon: value.icon,
  };
};
