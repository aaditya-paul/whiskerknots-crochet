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
  categoryId: string;
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

// ─── Reviews & Ratings ────────────────────────────────────────────────────────

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  content?: string;
  helpfulCount: number;
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
  reviewerName: string;
  reviewerPhotoUrl?: string;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus = "pending" | "completed" | "shipped" | "cancelled";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  lineTotal: number;
  productName: string;
  productImageUrl?: string;
  productVariantLabel?: string;
  createdAt: string;
}

export interface OrderShippingDetails {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  subtotalAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  shippingDetails?: OrderShippingDetails;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}
