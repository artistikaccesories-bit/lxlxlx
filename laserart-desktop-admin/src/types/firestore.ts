export interface ProductDoc {
  id: string;
  name: string;
  handle: string;
  price: number;
  description: string;
  image: string;
  images: string[];
  category: string;
  stock: number;
  isBestSeller: boolean;
  isProductOfTheWeek: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface VisitorDoc {
  id: string;
  timestamp?: unknown;
  lastActive?: unknown;
  isActive?: boolean;
  activeCartCount?: number;
  device?: string;
  location?: { city?: string; country?: string; region?: string };
  pagesViewed?: string[];
  durationSec?: number;
}

export interface OrderDoc {
  id: string;
  orderId: string;
  total: number;
  subtotal?: number;
  status: "pending" | "completed" | "cancelled";
  timestamp?: unknown;
  device?: string;
  location?: { city?: string; country?: string };
}

export interface InventoryEventDoc {
  id?: string;
  type: "created" | "updated" | "deleted" | "stock_adjustment";
  productId: string;
  productName: string;
  adminEmail: string;
  deltaStock?: number;
  at: unknown;
}

export interface DeliverySettingsDoc {
  standard: number;
  express: number;
  updatedAt?: unknown;
}

