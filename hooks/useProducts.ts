"use client";

import { useEffect, useState } from "react";
import { PRODUCTS } from "../constants/constants";
import { Product } from "../types/types";
import {
  getReadableSupabaseError,
  subscribeToProducts,
} from "../services/productCmsService";

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  usingFallback: boolean;
}

export const useProducts = (): UseProductsResult => {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (cmsProducts) => {
        if (cmsProducts.length > 0) {
          setProducts(cmsProducts);
          setUsingFallback(false);
        } else {
          setProducts(PRODUCTS);
          setUsingFallback(true);
        }

        setError(null);
        setLoading(false);
      },
      (cmsError, source) => {
        const readableError = getReadableSupabaseError(cmsError);
        if (source === "realtime") {
          console.warn(
            "Realtime update unavailable for products:",
            readableError,
            cmsError,
          );
          setError(`Realtime updates unavailable. ${readableError}`);
          return;
        }

        console.error(
          "Failed to load products from CMS:",
          readableError,
          cmsError,
        );
        setProducts(PRODUCTS);
        setUsingFallback(true);
        setError(
          `Unable to load products from CMS. Showing default catalog. ${readableError}`,
        );
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return {
    products,
    loading,
    error,
    usingFallback,
  };
};
