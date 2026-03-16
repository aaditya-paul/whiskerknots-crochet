"use client";

import React, { createContext, useEffect, useMemo, useState } from "react";
import { Category, Product } from "../types/types";
import {
  fetchCategories,
  getReadableCmsError,
  subscribeToProducts,
} from "../services/productCmsService";

export interface ProductsContextValue {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchCategories()
      .then((loadedCategories) => {
        if (isMounted) setCategories(loadedCategories);
      })
      .catch((err) => {
        console.warn("Could not load categories:", getReadableCmsError(err));
      });

    const unsubscribe = subscribeToProducts(
      (cmsProducts) => {
        if (!isMounted) return;
        setProducts(cmsProducts);
        setError(null);
        setLoading(false);
      },
      (cmsError, source) => {
        if (!isMounted) return;
        const readable = getReadableCmsError(cmsError);
        if (source === "realtime") {
          console.warn("Realtime unavailable:", readable);
          return;
        }
        console.error("Failed to load products:", readable);
        setError(readable);
        setLoading(false);
      },
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({ products, categories, loading, error }),
    [products, categories, loading, error],
  );

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
}
