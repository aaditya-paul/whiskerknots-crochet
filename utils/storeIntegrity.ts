import { Product } from "../types/types";

export type CartLikeItem = Product & { quantity: number };

const isFiniteNonNegativeNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

const hasRequiredProductSnapshotFields = (
  product: unknown,
): product is Pick<Product, "id" | "name" | "slug" | "price" | "status"> => {
  if (!product || typeof product !== "object") return false;

  const candidate = product as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    candidate.id.trim().length > 0 &&
    typeof candidate.name === "string" &&
    candidate.name.trim().length > 0 &&
    typeof candidate.slug === "string" &&
    candidate.slug.trim().length > 0 &&
    isFiniteNonNegativeNumber(candidate.price) &&
    typeof candidate.status === "string"
  );
};

const isProductActive = (product: Pick<Product, "status">) =>
  product.status === "active";

export const sanitizeFavoriteIds = (
  rawFavoriteIds: unknown,
  products: Product[],
): string[] => {
  const favoriteIds = Array.isArray(rawFavoriteIds)
    ? rawFavoriteIds.filter((id): id is string => typeof id === "string")
    : [];

  const activeProductIds = new Set(
    products
      .filter(
        (product) =>
          hasRequiredProductSnapshotFields(product) && isProductActive(product),
      )
      .map((product) => product.id),
  );

  return [...new Set(favoriteIds)].filter((id) => activeProductIds.has(id));
};

export const sanitizeCartItems = (
  rawItems: unknown,
  productsById?: Map<string, Product>,
): CartLikeItem[] => {
  if (!Array.isArray(rawItems)) return [];

  const mergedByProductId = new Map<string, CartLikeItem>();

  for (const rawItem of rawItems) {
    if (!rawItem || typeof rawItem !== "object") continue;

    const candidate = rawItem as Record<string, unknown>;
    const productId = typeof candidate.id === "string" ? candidate.id : null;
    if (!productId) continue;

    const parsedQuantity =
      typeof candidate.quantity === "number" &&
      Number.isFinite(candidate.quantity)
        ? Math.floor(candidate.quantity)
        : 0;
    if (parsedQuantity <= 0) continue;

    const catalogProduct = productsById?.get(productId);

    const normalizedProduct = catalogProduct
      ? catalogProduct
      : hasRequiredProductSnapshotFields(candidate)
        ? (candidate as Product)
        : null;

    if (!normalizedProduct || !isProductActive(normalizedProduct)) continue;

    const existing = mergedByProductId.get(productId);

    if (existing) {
      existing.quantity += parsedQuantity;
      continue;
    }

    mergedByProductId.set(productId, {
      ...normalizedProduct,
      quantity: parsedQuantity,
    });
  }

  return Array.from(mergedByProductId.values());
};
