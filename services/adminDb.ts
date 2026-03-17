import { supabase } from "../lib/supabase";
import {
  Category,
  Product,
  ProductImage,
  ProductVariant,
} from "../types/types";
import { normalizeProductImageUrl } from "../utils/productImages";

export const getReadableCmsError = (error: unknown): string => {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object") {
    const r = error as Record<string, unknown>;
    return [r.code ? `[${r.code}]` : null, r.message, r.details, r.hint]
      .filter(Boolean)
      .join(" ");
  }
  return "Unknown error";
};

const QUERY_TIMEOUT_MS = 12_000;
const UPLOAD_TIMEOUT_MS = 60_000;
const RETRYABLE_ERROR_SUBSTRINGS = ["lock broken by another request", "request was aborted", "aborterror", "timeout"];

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const withAbortTimeout = async <T>(task: (signal: AbortSignal) => Promise<T>, timeoutMs = QUERY_TIMEOUT_MS): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs);

  try {
    return await task(controller.signal);
  } finally {
    clearTimeout(timeoutId);
  }
};

const isRetryableCmsError = (error: unknown) => {
  const readable = getReadableCmsError(error).toLowerCase();
  return RETRYABLE_ERROR_SUBSTRINGS.some((token) => readable.includes(token));
};

const withRetry = async <T>(task: () => Promise<T>, retries = 2): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (attempt === retries || !isRetryableCmsError(error)) throw error;
      await sleep(200 * (attempt + 1));
    }
  }

  throw lastError;
};

const PRODUCT_SELECT = `
  id, name, slug, description, short_description, status,
  category_id, price, compare_at_price, cost_per_item, thumbnail_url,
  sku, barcode, in_stock, quantity, track_quantity, allow_backorder,
  weight, weight_unit, length, width, height, dimension_unit,
  tags, is_featured, is_new, sort_order,
  seo_title, seo_description, custom_fields,
  created_at, updated_at,
  category:categories(id, name, slug),
  images:product_images(id, product_id, url, storage_path, alt, is_thumbnail, sort_order, created_at)
`;

const PRODUCT_SELECT_WITH_VARIANTS = `${PRODUCT_SELECT},
  variants:product_variants(id, product_id, name, sku, price, compare_at_price, quantity, in_stock, image_url, attributes, sort_order, created_at)
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rowToProduct = (row: any): Product => {
  const images: ProductImage[] = Array.isArray(row.images)
    ? [...row.images]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(
          (img) =>
            ({
              id: img.id,
              productId: img.product_id,
              url: normalizeProductImageUrl(img.url, img.storage_path ?? undefined) ?? img.url,
              storagePath: img.storage_path ?? undefined,
              alt: img.alt ?? "",
              isThumbnail: img.is_thumbnail,
              sortOrder: img.sort_order,
              createdAt: img.created_at,
            }) satisfies ProductImage,
        )
    : [];

  const thumbnail = images.find((img) => img.isThumbnail)?.url;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    shortDescription: row.short_description ?? undefined,
    status: row.status,
    categoryId: row.category_id,
    category: row.category
      ? {
          id: row.category.id,
          name: row.category.name,
          slug: row.category.slug,
        }
      : undefined,
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    costPerItem: row.cost_per_item ?? undefined,
    thumbnailUrl: normalizeProductImageUrl(row.thumbnail_url ?? thumbnail ?? undefined) ?? row.thumbnail_url ?? thumbnail,
    sku: row.sku ?? undefined,
    barcode: row.barcode ?? undefined,
    inStock: row.in_stock,
    quantity: row.quantity ?? undefined,
    trackQuantity: row.track_quantity,
    allowBackorder: row.allow_backorder,
    weight: row.weight ?? undefined,
    weightUnit: row.weight_unit ?? undefined,
    length: row.length ?? undefined,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    dimensionUnit: row.dimension_unit ?? undefined,
    tags: row.tags ?? [],
    isFeatured: row.is_featured,
    isNew: row.is_new,
    sortOrder: row.sort_order,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    customFields: row.custom_fields ?? {},
    images,
    variants: Array.isArray(row.variants)
      ? [...row.variants]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map(
            (v) =>
              ({
                id: v.id,
                productId: v.product_id,
                name: v.name,
                sku: v.sku ?? undefined,
                price: v.price ?? undefined,
                compareAtPrice: v.compare_at_price ?? undefined,
                quantity: v.quantity ?? undefined,
                inStock: v.in_stock,
                imageUrl: v.image_url ?? undefined,
                attributes: v.attributes ?? {},
                sortOrder: v.sort_order,
                createdAt: v.created_at,
              }) satisfies ProductVariant,
          )
      : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rowToCategory = (row: any): Category => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description ?? undefined,
  imageUrl: row.image_url ?? undefined,
  parentId: row.parent_id ?? undefined,
  isActive: row.is_active,
  sortOrder: row.sort_order,
  seoTitle: row.seo_title ?? undefined,
  seoDescription: row.seo_description ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

let adminProductsRequest: Promise<Product[]> | null = null;
let adminCategoriesRequest: Promise<Category[]> | null = null;

export const adminFetchProducts = async (): Promise<Product[]> => {
  if (adminProductsRequest) return adminProductsRequest;

  adminProductsRequest = withRetry(() =>
    withAbortTimeout((signal) =>
      supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .abortSignal(signal),
    ),
  )
    .then(({ data, error }) => {
      if (error) throw error;
      return (data ?? []).map(rowToProduct);
    })
    .finally(() => {
      adminProductsRequest = null;
    });

  return adminProductsRequest;
};

export const adminFetchProduct = async (id: string): Promise<Product | null> => {
  const { data, error } = await withRetry(() =>
    withAbortTimeout((signal) =>
      supabase.from("products").select(PRODUCT_SELECT_WITH_VARIANTS).eq("id", id).single().abortSignal(signal),
    ),
  );

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data ? rowToProduct(data) : null;
};

export const adminFetchCategories = async (): Promise<Category[]> => {
  if (adminCategoriesRequest) return adminCategoriesRequest;

  adminCategoriesRequest = withRetry(() =>
    withAbortTimeout((signal) =>
      supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true })
        .abortSignal(signal),
    ),
  )
    .then(({ data, error }) => {
      if (error) throw error;
      return (data ?? []).map(rowToCategory);
    })
    .finally(() => {
      adminCategoriesRequest = null;
    });

  return adminCategoriesRequest;
};

export type ProductWriteData = {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  status: "active" | "draft" | "archived";
  categoryId: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  thumbnailUrl?: string;
  sku?: string;
  barcode?: string;
  inStock: boolean;
  quantity?: number;
  trackQuantity: boolean;
  allowBackorder: boolean;
  weight?: number;
  weightUnit?: string;
  length?: number;
  width?: number;
  height?: number;
  dimensionUnit?: string;
  tags?: string[];
  isFeatured: boolean;
  isNew: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  customFields?: Record<string, unknown>;
};

const productWritePayload = (d: ProductWriteData) => ({
  name: d.name,
  slug: d.slug,
  description: d.description ?? null,
  short_description: d.shortDescription ?? null,
  status: d.status,
  category_id: d.categoryId,
  price: d.price,
  compare_at_price: d.compareAtPrice ?? null,
  cost_per_item: d.costPerItem ?? null,
  thumbnail_url: d.thumbnailUrl ?? null,
  sku: d.sku ?? null,
  barcode: d.barcode ?? null,
  in_stock: d.inStock,
  quantity: d.quantity ?? null,
  track_quantity: d.trackQuantity,
  allow_backorder: d.allowBackorder,
  weight: d.weight ?? null,
  weight_unit: d.weightUnit ?? "g",
  length: d.length ?? null,
  width: d.width ?? null,
  height: d.height ?? null,
  dimension_unit: d.dimensionUnit ?? "cm",
  tags: d.tags ?? [],
  is_featured: d.isFeatured,
  is_new: d.isNew,
  sort_order: d.sortOrder ?? 0,
  seo_title: d.seoTitle ?? null,
  seo_description: d.seoDescription ?? null,
  custom_fields: d.customFields ?? {},
});

export const adminCreateProduct = async (data: ProductWriteData, explicitId?: string): Promise<string> => {
  const payload = explicitId ? { id: explicitId, ...productWritePayload(data) } : productWritePayload(data);

  const { data: row, error } = await withRetry(() =>
    withAbortTimeout((signal) => supabase.from("products").insert(payload).select("id").single().abortSignal(signal)),
  );

  if (error) throw error;
  return row.id as string;
};

export const adminUpdateProduct = async (id: string, data: ProductWriteData): Promise<void> => {
  const { error } = await withRetry(() =>
    withAbortTimeout((signal) => supabase.from("products").update(productWritePayload(data)).eq("id", id).abortSignal(signal)),
  );
  if (error) throw error;
};

export const adminDeleteProduct = async (id: string): Promise<void> => {
  const { error } = await withRetry(() =>
    withAbortTimeout((signal) => supabase.from("products").delete().eq("id", id).abortSignal(signal)),
  );
  if (error) throw error;
};

export type CategoryWriteData = {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
};

const categoryWritePayload = (d: CategoryWriteData) => ({
  name: d.name,
  slug: d.slug,
  description: d.description ?? null,
  image_url: d.imageUrl ?? null,
  parent_id: d.parentId ?? null,
  is_active: d.isActive,
  sort_order: d.sortOrder ?? 0,
  seo_title: d.seoTitle ?? null,
  seo_description: d.seoDescription ?? null,
});

export const adminCreateCategory = async (data: CategoryWriteData): Promise<string> => {
  const { data: row, error } = await withRetry(() =>
    withAbortTimeout((signal) =>
      supabase.from("categories").insert(categoryWritePayload(data)).select("id").single().abortSignal(signal),
    ),
  );
  if (error) throw error;
  return row.id;
};

export const adminUpdateCategory = async (id: string, data: CategoryWriteData): Promise<void> => {
  const { error } = await withRetry(() =>
    withAbortTimeout((signal) => supabase.from("categories").update(categoryWritePayload(data)).eq("id", id).abortSignal(signal)),
  );
  if (error) throw error;
};

export const adminDeleteCategory = async (id: string): Promise<void> => {
  const { error } = await withRetry(() =>
    withAbortTimeout((signal) => supabase.from("categories").delete().eq("id", id).abortSignal(signal)),
  );
  if (error) throw error;
};

const BUCKET = "product-media";

export const adminUploadImage = async (file: File, productId: string): Promise<{ url: string; storagePath: string }> => {
  const ext = file.name.split(".").pop() ?? "jpg";
  const storagePath = `products/${productId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await Promise.race([
    supabase.storage.from(BUCKET).upload(storagePath, file, { contentType: file.type, upsert: false }),
    new Promise<{ error: Error }>((_, reject) => setTimeout(() => reject(new Error(`Upload timeout after ${UPLOAD_TIMEOUT_MS}ms`)), UPLOAD_TIMEOUT_MS)),
  ]);
  if (error) throw error;

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return { url: urlData.publicUrl, storagePath };
};

export const adminDeleteImageFromStorage = async (storagePath: string): Promise<void> => {
  const { error } = await withRetry(() =>
    Promise.race([
      supabase.storage.from(BUCKET).remove([storagePath]),
      new Promise<{ error: Error }>((_, reject) =>
        setTimeout(() => reject(new Error(`Request timeout after ${QUERY_TIMEOUT_MS}ms`)), QUERY_TIMEOUT_MS),
      ),
    ]),
  );
  if (error) throw error;
};

export type ImageWriteData = { url: string; storagePath?: string; alt: string; isThumbnail: boolean; sortOrder: number };

export const adminSyncProductImages = async (productId: string, images: (ImageWriteData & { id?: string })[]): Promise<void> => {
  await withRetry(async () => {
    const { error: delError } = await withAbortTimeout((signal) =>
      supabase.from("product_images").delete().eq("product_id", productId).abortSignal(signal),
    );
    if (delError) throw delError;

    if (images.length === 0) return;

    const rows = images.map((img, i) => ({
      product_id: productId,
      url: img.url,
      storage_path: img.storagePath ?? null,
      alt: img.alt,
      is_thumbnail: img.isThumbnail,
      sort_order: i,
    }));

    const { error } = await withAbortTimeout((signal) => supabase.from("product_images").insert(rows).abortSignal(signal));
    if (error) throw error;
  });
};

export type VariantWriteData = {
  name: string;
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  quantity?: number;
  inStock: boolean;
  imageUrl?: string;
  attributes: Record<string, string>;
  sortOrder?: number;
};

export const adminSyncProductVariants = async (productId: string, variants: VariantWriteData[]): Promise<void> => {
  await withRetry(async () => {
    const { error: delError } = await withAbortTimeout((signal) =>
      supabase.from("product_variants").delete().eq("product_id", productId).abortSignal(signal),
    );
    if (delError) throw delError;

    if (variants.length === 0) return;

    const rows = variants.map((v, i) => ({
      product_id: productId,
      name: v.name,
      sku: v.sku ?? null,
      price: v.price ?? null,
      compare_at_price: v.compareAtPrice ?? null,
      quantity: v.quantity ?? null,
      in_stock: v.inStock,
      image_url: v.imageUrl ?? null,
      attributes: v.attributes,
      sort_order: i,
    }));

    const { error } = await withAbortTimeout((signal) => supabase.from("product_variants").insert(rows).abortSignal(signal));
    if (error) throw error;
  });
};
