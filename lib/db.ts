import { createBrowserClient } from "@supabase/ssr";
import {
  Category,
  Product,
  ProductImage,
  ProductVariant,
} from "../types/types";
import { normalizeProductImageUrl } from "../utils/productImages";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

if (!supabaseUrl && typeof window !== "undefined") {
  console.warn(
    "Missing NEXT_PUBLIC_SUPABASE_URL. Set it in .env.local to enable Supabase auth and data operations.",
  );
}

if (!supabasePublishableKey && typeof window !== "undefined") {
  console.warn(
    "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY fallback). Set it in .env.local to enable Supabase auth and data operations.",
  );
}

const REST_FETCH_ABORT_MS = 14_000;
const STORAGE_FETCH_ABORT_MS = 65_000;
const QUERY_TIMEOUT_MS = 15_000;
const UPLOAD_TIMEOUT_MS = 70_000;
const PRODUCTS_CACHE_TTL_MS = 15_000;
const CATEGORIES_CACHE_TTL_MS = 60_000;

const RETRYABLE_ERROR_SUBSTRINGS = [
  "lock broken by another request",
  "request was aborted",
  "aborterror",
  "timeout",
];

const JWT_FUTURE_ERROR_SUBSTRINGS = [
  "jwt issued at future",
  "[pgrst303]",
  "pgrst303",
];

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

const PRODUCT_SELECT_WITH_VARIANTS =
  PRODUCT_SELECT +
  `,
  variants:product_variants(id, product_id, name, sku, price, compare_at_price, quantity, in_stock, image_url, attributes, sort_order, created_at)
`;

const BUCKET = "product-media";

let productsCache: { data: Product[]; timestamp: number } | null = null;
let categoriesCache: { data: Category[]; timestamp: number } | null = null;
let productsRequest: Promise<Product[]> | null = null;
let categoriesRequest: Promise<Category[]> | null = null;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const withTimeout = async <T>(
  task: PromiseLike<T>,
  timeoutMs = QUERY_TIMEOUT_MS,
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      Promise.resolve(task),
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`Request timeout after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const isCacheFresh = (timestamp: number, ttlMs: number) =>
  Date.now() - timestamp < ttlMs;

export const getReadableDbError = (error: unknown): string => {
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

export const getReadableCmsError = getReadableDbError;
export const getReadableSupabaseError = getReadableDbError;

const isRetryableDbError = (error: unknown) => {
  const readable = getReadableDbError(error).toLowerCase();
  return RETRYABLE_ERROR_SUBSTRINGS.some((token) => readable.includes(token));
};

const isJwtIssuedAtFutureError = (error: unknown) => {
  const readable = getReadableDbError(error).toLowerCase();
  return JWT_FUTURE_ERROR_SUBSTRINGS.some((token) => readable.includes(token));
};

const isStorageRequest = (input: RequestInfo | URL): boolean => {
  const url =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.href
        : (input as Request).url;
  return url.includes("/storage/v1/");
};

const abortingFetch: typeof fetch = (input, init) => {
  const timeoutMs = isStorageRequest(input)
    ? STORAGE_FETCH_ABORT_MS
    : REST_FETCH_ABORT_MS;
  const controller = new AbortController();

  const upstreamSignal = (init as RequestInit | undefined)?.signal ?? null;
  const abortFromUpstream = () => controller.abort(upstreamSignal?.reason);
  if (upstreamSignal) {
    if (upstreamSignal.aborted) {
      controller.abort(upstreamSignal.reason);
    } else {
      upstreamSignal.addEventListener("abort", abortFromUpstream, {
        once: true,
      });
    }
  }

  const timeoutId = setTimeout(
    () =>
      controller.abort(
        new Error(`Supabase request timed out after ${timeoutMs}ms`),
      ),
    timeoutMs,
  );

  return globalThis
    .fetch(input, { ...init, signal: controller.signal })
    .finally(() => {
      clearTimeout(timeoutId);
      upstreamSignal?.removeEventListener("abort", abortFromUpstream);
    });
};

export const supabase = createBrowserClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    global: { fetch: abortingFetch },
  },
);

const clearLocalSupabaseSession = async () => {
  if (typeof window === "undefined") return;

  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // Best effort local cleanup.
  }

  try {
    const storageKeys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key) storageKeys.push(key);
    }

    storageKeys
      .filter((key) => key.startsWith("sb-") && key.endsWith("-auth-token"))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // localStorage may be unavailable in strict/private contexts.
  }
};

const withRetry = async <T>(task: () => Promise<T>, retries = 2) => {
  let lastError: unknown;
  let jwtSessionCleared = false;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;

      if (isJwtIssuedAtFutureError(error) && !jwtSessionCleared) {
        jwtSessionCleared = true;
        await clearLocalSupabaseSession();
        continue;
      }

      if (attempt === retries || !isRetryableDbError(error)) {
        throw error;
      }
      await sleep(200 * (attempt + 1));
    }
  }

  throw lastError;
};

const invalidateProductsCache = () => {
  productsCache = null;
  productsRequest = null;
};

const invalidateCategoriesCache = () => {
  categoriesCache = null;
  categoriesRequest = null;
};

const invalidateStorefrontCache = () => {
  invalidateProductsCache();
  invalidateCategoriesCache();
};

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
              url:
                normalizeProductImageUrl(
                  img.url,
                  img.storage_path ?? undefined,
                ) ?? img.url,
              storagePath: img.storage_path ?? undefined,
              alt: img.alt ?? "",
              isThumbnail: img.is_thumbnail,
              sortOrder: img.sort_order,
              createdAt: img.created_at,
            }) satisfies ProductImage,
        )
    : [];

  const primaryImage =
    images.find((image) => image.isThumbnail)?.url ?? images[0]?.url;

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
    price: Number(row.price),
    compareAtPrice:
      row.compare_at_price != null ? Number(row.compare_at_price) : undefined,
    costPerItem:
      row.cost_per_item != null ? Number(row.cost_per_item) : undefined,
    thumbnailUrl:
      normalizeProductImageUrl(row.thumbnail_url ?? undefined) ?? primaryImage,
    image:
      normalizeProductImageUrl(row.thumbnail_url ?? undefined) ?? primaryImage,
    images,
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
    customFields: row.custom_fields ?? undefined,
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
                price: v.price != null ? Number(v.price) : undefined,
                compareAtPrice:
                  v.compare_at_price != null
                    ? Number(v.compare_at_price)
                    : undefined,
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

export type ImageWriteData = {
  url: string;
  storagePath?: string;
  alt: string;
  isThumbnail: boolean;
  sortOrder: number;
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

export const fetchProducts = async (options?: {
  forceRefresh?: boolean;
}): Promise<Product[]> => {
  const staleProducts = productsCache?.data ?? null;

  if (
    !options?.forceRefresh &&
    productsCache &&
    isCacheFresh(productsCache.timestamp, PRODUCTS_CACHE_TTL_MS)
  ) {
    return productsCache.data;
  }

  if (productsRequest) return productsRequest;

  productsRequest = withRetry(async () => {
    const { data, error } = await withTimeout(
      supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("status", "active")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
    );

    if (error) throw error;

    const mappedProducts = (data ?? []).map(rowToProduct);
    productsCache = { data: mappedProducts, timestamp: Date.now() };
    return mappedProducts;
  }).catch((err) => {
    productsRequest = null;
    if (staleProducts) {
      productsCache = {
        data: staleProducts,
        timestamp: 0,
      };
      return staleProducts;
    }
    productsCache = null;
    throw err;
  });

  try {
    return await productsRequest;
  } finally {
    productsRequest = null;
  }
};

export const fetchProductBySlug = async (
  slug: string,
): Promise<Product | null> => {
  const { data, error } = await withTimeout(
    supabase
      .from("products")
      .select(PRODUCT_SELECT_WITH_VARIANTS)
      .eq("status", "active")
      .eq("slug", slug)
      .single(),
  );

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data ? rowToProduct(data) : null;
};

export const fetchCategories = async (): Promise<Category[]> => {
  if (
    categoriesCache &&
    isCacheFresh(categoriesCache.timestamp, CATEGORIES_CACHE_TTL_MS)
  ) {
    return categoriesCache.data;
  }

  if (categoriesRequest) return categoriesRequest;

  categoriesRequest = withRetry(async () => {
    const { data, error } = await withTimeout(
      supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
    );

    if (error) throw error;

    const mappedCategories = (data ?? []).map(rowToCategory);
    categoriesCache = { data: mappedCategories, timestamp: Date.now() };
    return mappedCategories;
  }).catch((err) => {
    categoriesRequest = null;
    categoriesCache = null;
    throw err;
  });

  try {
    return await categoriesRequest;
  } finally {
    categoriesRequest = null;
  }
};

// Compatibility API for existing ProductsContext callers. Intentionally no
// interval polling to avoid idle requests and timeout cascades.
export const subscribeToProducts = (
  onData: (products: Product[]) => void,
  onError?: (err: unknown, source: "fetch" | "realtime") => void,
) => {
  let isActive = true;

  void fetchProducts()
    .then((products) => {
      if (!isActive) return;
      onData(products);
    })
    .catch((err) => {
      if (!isActive) return;
      onError?.(err, "fetch");
    });

  return () => {
    isActive = false;
  };
};

export const adminFetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await withRetry(() =>
    withTimeout(
      supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
    ),
  );

  if (error) throw error;
  return (data ?? []).map(rowToProduct);
};

export const adminFetchProduct = async (
  id: string,
): Promise<Product | null> => {
  const { data, error } = await withRetry(() =>
    withTimeout(
      supabase
        .from("products")
        .select(PRODUCT_SELECT_WITH_VARIANTS)
        .eq("id", id)
        .single(),
    ),
  );

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data ? rowToProduct(data) : null;
};

export const adminFetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await withRetry(() =>
    withTimeout(
      supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
    ),
  );

  if (error) throw error;
  return (data ?? []).map(rowToCategory);
};

export const adminCreateProduct = async (
  data: ProductWriteData,
  preGeneratedId?: string,
): Promise<string> => {
  const payload = productWritePayload(data);
  if (preGeneratedId) (payload as Record<string, unknown>).id = preGeneratedId;

  return withRetry(async () => {
    const { data: row, error } = await withTimeout(
      supabase.from("products").insert(payload).select("id").single(),
    );
    if (error) throw error;
    invalidateProductsCache();
    return row.id as string;
  });
};

export const adminUpdateProduct = async (
  id: string,
  data: ProductWriteData,
): Promise<void> => {
  return withRetry(async () => {
    const { error } = await withTimeout(
      supabase.from("products").update(productWritePayload(data)).eq("id", id),
    );
    if (error) throw error;
    invalidateProductsCache();
  });
};

export const adminDeleteProduct = async (id: string): Promise<void> => {
  const { error } = await withTimeout(
    supabase.from("products").delete().eq("id", id),
  );

  if (error) throw error;
  invalidateProductsCache();
};

export const adminCreateCategory = async (
  data: CategoryWriteData,
): Promise<string> => {
  const { data: row, error } = await withTimeout(
    supabase
      .from("categories")
      .insert(categoryWritePayload(data))
      .select("id")
      .single(),
  );

  if (error) throw error;
  invalidateStorefrontCache();
  return row.id;
};

export const adminUpdateCategory = async (
  id: string,
  data: CategoryWriteData,
): Promise<void> => {
  const { error } = await withTimeout(
    supabase.from("categories").update(categoryWritePayload(data)).eq("id", id),
  );

  if (error) throw error;
  invalidateStorefrontCache();
};

export const adminDeleteCategory = async (id: string): Promise<void> => {
  const { error } = await withTimeout(
    supabase.from("categories").delete().eq("id", id),
  );

  if (error) throw error;
  invalidateStorefrontCache();
};

export const adminUploadImage = async (
  file: File,
  productId: string,
): Promise<{ url: string; storagePath: string }> => {
  const ext = file.name.split(".").pop() ?? "jpg";
  const storagePath = `products/${productId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await withTimeout(
    supabase.storage.from(BUCKET).upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    }),
    UPLOAD_TIMEOUT_MS,
  );

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);
  return { url: urlData.publicUrl, storagePath };
};

export const adminDeleteImageFromStorage = async (
  storagePath: string,
): Promise<void> => {
  const { error } = await withTimeout(
    supabase.storage.from(BUCKET).remove([storagePath]),
  );

  if (error) throw error;
};

export const adminSyncProductImages = async (
  productId: string,
  images: (ImageWriteData & { id?: string })[],
): Promise<void> => {
  return withRetry(async () => {
    const { error: delError } = await withTimeout(
      supabase.from("product_images").delete().eq("product_id", productId),
    );
    if (delError) throw delError;

    if (images.length === 0) {
      invalidateProductsCache();
      return;
    }

    const rows = images.map((img, i) => ({
      product_id: productId,
      url: img.url,
      storage_path: img.storagePath ?? null,
      alt: img.alt,
      is_thumbnail: img.isThumbnail,
      sort_order: i,
    }));

    const { error } = await withTimeout(
      supabase.from("product_images").insert(rows),
    );
    if (error) throw error;
    invalidateProductsCache();
  });
};

export const adminSyncProductVariants = async (
  productId: string,
  variants: VariantWriteData[],
): Promise<void> => {
  return withRetry(async () => {
    const { error: delError } = await withTimeout(
      supabase.from("product_variants").delete().eq("product_id", productId),
    );
    if (delError) throw delError;

    if (variants.length === 0) {
      invalidateProductsCache();
      return;
    }

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

    const { error } = await withTimeout(
      supabase.from("product_variants").insert(rows),
    );
    if (error) throw error;
    invalidateProductsCache();
  });
};

export type DbProfile = {
  id: string;
  email: string | null;
  display_name: string | null;
  photo_url: string | null;
  created_at: string | null;
};

export const dbAuth = {
  getSession: () => supabase.auth.getSession(),
  onAuthStateChange: (
    callback: Parameters<typeof supabase.auth.onAuthStateChange>[0],
  ) => supabase.auth.onAuthStateChange(callback),
  signUp: (email: string, password: string, displayName: string) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName,
        },
      },
    }),
  signInWithPassword: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),
  signOut: (scope?: "global" | "local" | "others") =>
    scope ? supabase.auth.signOut({ scope }) : supabase.auth.signOut(),
  updateUserDisplayName: (displayName: string) =>
    supabase.auth.updateUser({
      data: {
        full_name: displayName,
      },
    }),
};

export const dbProfiles = {
  fetchByUserId: async (userId: string): Promise<DbProfile | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,display_name,photo_url,created_at")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data as DbProfile;
  },
  upsert: async (profile: {
    id: string;
    email: string;
    displayName: string | null;
    photoUrl: string | null;
    createdAt: string;
  }) => {
    const { error } = await supabase.from("profiles").upsert(
      {
        id: profile.id,
        email: profile.email,
        display_name: profile.displayName,
        photo_url: profile.photoUrl,
        created_at: profile.createdAt,
      },
      {
        onConflict: "id",
      },
    );

    if (error) throw error;
  },
};

export const dbUserState = {
  fetchByUserId: async (
    userId: string,
  ): Promise<{
    cart: unknown;
    favorites: unknown;
  } | null> => {
    const { data, error } = await supabase
      .from("user_state")
      .select("cart,favorites")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return {
      cart: data.cart,
      favorites: data.favorites,
    };
  },
  upsert: async (payload: {
    userId: string;
    cart?: unknown;
    favorites?: unknown;
  }) => {
    const { error } = await supabase.from("user_state").upsert(
      {
        user_id: payload.userId,
        cart: payload.cart,
        favorites: payload.favorites,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    );

    if (error) throw error;
  },
  ensureEmptyRow: async (userId: string) => {
    const { error } = await supabase.from("user_state").upsert(
      {
        user_id: userId,
        cart: [],
        favorites: [],
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    );

    if (error) throw error;
  },
};

export type ProductFormData = ProductWriteData;
export const createProductInCms = adminCreateProduct;
export const updateProductInCms = async (id: string, data: ProductWriteData) =>
  adminUpdateProduct(id, data);
export const seedProductsToCms = async () => {
  // No longer needed. Add products via the admin panel.
};
