import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { Product } from "../types/types";

const PRODUCTS_TABLE = "products";

export type ProductFormData = Omit<Product, "id">;

export const getReadableSupabaseError = (error: unknown): string => {
  if (!error) {
    return "Unknown Supabase error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message || "Unknown Supabase error";
  }

  if (typeof error === "object") {
    const record = error as Record<string, unknown>;
    const code = typeof record.code === "string" ? record.code : undefined;
    const message =
      typeof record.message === "string" ? record.message : undefined;
    const details =
      typeof record.details === "string" ? record.details : undefined;
    const hint = typeof record.hint === "string" ? record.hint : undefined;

    if (message || details || hint) {
      return [code ? `[${code}]` : null, message, details, hint]
        .filter(Boolean)
        .join(" ");
    }

    const ownProps = Object.getOwnPropertyNames(error);
    if (ownProps.length > 0) {
      return `Supabase error object with fields: ${ownProps.join(", ")}`;
    }
  }

  return "Unknown Supabase error";
};

const isValidProduct = (product: Partial<Product>): product is Product => {
  return Boolean(
    product.id &&
    product.name &&
    typeof product.price === "number" &&
    product.category &&
    product.image &&
    product.description &&
    product.slug,
  );
};

const normalizeProducts = (products: Product[]): Product[] => {
  return [...products].sort((a, b) => a.name.localeCompare(b.name));
};

export const subscribeToProducts = (
  onData: (products: Product[]) => void,
  onError?: (error: unknown, source: "fetch" | "realtime") => void,
) => {
  let channel: RealtimeChannel | null = null;
  const channelTopic = `products-realtime-${Math.random().toString(36).slice(2)}`;

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from(PRODUCTS_TABLE)
      .select("id,name,price,category,image,description,is_featured,slug")
      .order("name", { ascending: true });

    if (error) {
      if (onError) {
        onError(error, "fetch");
      }
      return;
    }

    const normalized = (data || [])
      .map((item) => {
        const product: Partial<Product> = {
          id: item.id,
          name: item.name,
          price: Number(item.price),
          category: item.category,
          image: item.image,
          description: item.description,
          isFeatured: item.is_featured,
          slug: item.slug,
        };

        return isValidProduct(product) ? product : null;
      })
      .filter((product): product is Product => product !== null);

    onData(normalizeProducts(normalized));
  };

  fetchProducts();

  channel = supabase
    .channel(channelTopic)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: PRODUCTS_TABLE },
      () => {
        fetchProducts();
      },
    )
    .subscribe((status, subscriptionError) => {
      if ((status === "CHANNEL_ERROR" || status === "TIMED_OUT") && onError) {
        const readable = getReadableSupabaseError(subscriptionError);

        // In dev/hot-reload, stale socket bindings can surface this channel-level mismatch.
        // Keep data flow alive by not treating it as a fatal products fetch error.
        if (
          readable
            .toLowerCase()
            .includes(
              "mismatch between server and client bindings for postgres changes",
            )
        ) {
          return;
        }

        onError(
          subscriptionError || new Error(`Realtime channel status: ${status}`),
          "realtime",
        );
      }
    });

  return () => {
    if (channel) {
      supabase.removeChannel(channel);
    }
  };
};

export const createProductInCms = async (product: ProductFormData) => {
  const { error } = await supabase.from(PRODUCTS_TABLE).insert({
    name: product.name,
    price: product.price,
    category: product.category,
    image: product.image,
    description: product.description,
    is_featured: Boolean(product.isFeatured),
    slug: product.slug,
  });

  if (error) {
    throw error;
  }
};

export const updateProductInCms = async (
  productId: string,
  updates: ProductFormData,
) => {
  const { error } = await supabase
    .from(PRODUCTS_TABLE)
    .update({
      name: updates.name,
      price: updates.price,
      category: updates.category,
      image: updates.image,
      description: updates.description,
      is_featured: Boolean(updates.isFeatured),
      slug: updates.slug,
    })
    .eq("id", productId);

  if (error) {
    throw error;
  }
};

export const seedProductsToCms = async (products: Product[]) => {
  const { data: existingProducts, error: fetchError } = await supabase
    .from(PRODUCTS_TABLE)
    .select("slug");

  if (fetchError) {
    throw fetchError;
  }

  const existingSlugs = new Set(
    (existingProducts || []).map((item) => item.slug),
  );

  const toInsert = products
    .filter((product) => !existingSlugs.has(product.slug))
    .map((product) => ({
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      description: product.description,
      is_featured: Boolean(product.isFeatured),
      slug: product.slug,
    }));

  if (toInsert.length === 0) {
    return;
  }

  const { error: insertError } = await supabase
    .from(PRODUCTS_TABLE)
    .insert(toInsert);

  if (insertError) {
    throw insertError;
  }
};
