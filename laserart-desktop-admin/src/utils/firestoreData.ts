import type { ProductDoc } from "../types/firestore";

export const COLLECTIONS = {
  products: "products",
  visitors: "visitors",
  orders: "orders",
  inventoryEvents: "inventoryEvents",
  settings: "settings",
} as const;

export const slugifyHandle = (value: string): string =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const toSafeDate = (value: any): Date => {
  if (value && typeof value.toDate === "function") return value.toDate();
  if (value?.seconds) return new Date(value.seconds * 1000);
  if (value instanceof Date) return value;
  return new Date();
};

export const normalizeProductDoc = (id: string, data: any): ProductDoc => {
  const name = String(data?.name || "Untitled Product").trim();
  const image = String(data?.image || "");
  const images = Array.isArray(data?.images) ? data.images.filter(Boolean) : image ? [image] : [];
  return {
    id,
    name,
    handle: String(data?.handle || slugifyHandle(name) || id),
    price: Number(data?.price) || 0,
    description: String(data?.description || ""),
    image: image || images[0] || "",
    images,
    category: String(data?.category || "keychain"),
    stock: Number(data?.stock ?? 0),
    isBestSeller: Boolean(data?.isBestSeller),
    isProductOfTheWeek: Boolean(data?.isProductOfTheWeek),
    createdAt: data?.createdAt,
    updatedAt: data?.updatedAt,
  };
};

