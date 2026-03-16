export enum Page {
  HOME = "HOME",
  SHOP = "SHOP",
  ABOUT = "ABOUT",
  CONTACT = "CONTACT",
}

// ─── CMS Types ────────────────────────────────────────────────────────────────

export type ProductStatus = "active" | "draft" | "archived";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  storagePath?: string;
  alt: string;
  isThumbnail: boolean;
  sortOrder: number;
  createdAt?: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  quantity?: number;
  inStock: boolean;
  imageUrl?: string;
  attributes: Record<string, string>;
  sortOrder: number;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  status: ProductStatus;
  categoryId?: string;
  category?: Pick<Category, "id" | "name" | "slug">;

  // Pricing
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;

  // Media
  thumbnailUrl?: string;
  /** @deprecated use thumbnailUrl; kept for backward-compat with cart context */
  image?: string;
  images?: ProductImage[];

  // Inventory
  sku?: string;
  barcode?: string;
  inStock: boolean;
  quantity?: number;
  trackQuantity: boolean;
  allowBackorder: boolean;

  // Shipping
  weight?: number;
  weightUnit?: string;
  length?: number;
  width?: number;
  height?: number;
  dimensionUnit?: string;

  // Organisation
  tags?: string[];
  isFeatured: boolean;
  isNew: boolean;
  sortOrder: number;

  // SEO
  seoTitle?: string;
  seoDescription?: string;

  // Custom / flexible
  customFields?: Record<string, unknown>;

  // Relations
  variants?: ProductVariant[];

  createdAt: string;
  updatedAt: string;
}

// ─── Storefront / UI Types ────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
}
