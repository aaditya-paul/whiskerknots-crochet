import { Product, ProductImage } from "../types/types";

const DEFAULT_PRODUCT_IMAGE = "https://picsum.photos/800/800";
const PUBLIC_BUCKET_PATH = "/storage/v1/object/public/product-media/";

const getSupabaseBaseUrl = () =>
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");

export const normalizeProductImageUrl = (
  url?: string,
  storagePath?: string,
): string | undefined => {
  const trimmedUrl = url?.trim();
  if (trimmedUrl) {
    if (/^https?:\/\//i.test(trimmedUrl)) {
      return trimmedUrl;
    }

    if (trimmedUrl.startsWith(PUBLIC_BUCKET_PATH)) {
      const supabaseBaseUrl = getSupabaseBaseUrl();
      return supabaseBaseUrl ? `${supabaseBaseUrl}${trimmedUrl}` : trimmedUrl;
    }
  }

  const trimmedStoragePath = storagePath?.trim().replace(/^\/+/, "");
  if (trimmedStoragePath) {
    const supabaseBaseUrl = getSupabaseBaseUrl();
    if (!supabaseBaseUrl) {
      return undefined;
    }

    return `${supabaseBaseUrl}${PUBLIC_BUCKET_PATH}${trimmedStoragePath}`;
  }

  return undefined;
};

export const getProductPrimaryImage = (product: Product): string => {
  const thumbnailImage =
    product.images?.find((image) => image.isThumbnail) ?? product.images?.[0];

  return (
    normalizeProductImageUrl(product.thumbnailUrl) ??
    normalizeProductImageUrl(product.image) ??
    normalizeProductImageUrl(
      thumbnailImage?.url,
      thumbnailImage?.storagePath,
    ) ??
    DEFAULT_PRODUCT_IMAGE
  );
};

export const getProductGalleryImages = (product: Product): string[] => {
  const normalizedImages = (product.images ?? [])
    .map((image: ProductImage) =>
      normalizeProductImageUrl(image.url, image.storagePath),
    )
    .filter((imageUrl): imageUrl is string => Boolean(imageUrl));

  const primaryImage = getProductPrimaryImage(product);
  return [...new Set([primaryImage, ...normalizedImages])];
};

export const isUnoptimizedImageUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return ["127.0.0.1", "localhost"].includes(parsedUrl.hostname);
  } catch {
    return false;
  }
};

export const DEFAULT_PRODUCT_IMAGE_URL = DEFAULT_PRODUCT_IMAGE;
