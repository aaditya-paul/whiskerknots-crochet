"use client";

import React, { createContext, useEffect, useMemo, useState } from "react";
import { Category, Product } from "../types/types";
import {
  fetchCategories,
  fetchProducts,
  getReadableCmsError,
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
    let watchdogActive = true;
    const stopWatchdog = () => {
      watchdogActive = false;
      clearTimeout(loadingWatchdog);
    };

    const loadingWatchdog = setTimeout(() => {
      if (!isMounted) return;
      if (!watchdogActive) return;
      setError("Loading products took too long. Please refresh.");
      setLoading(false);
    }, 45_000);

    Promise.all([fetchProducts(), fetchCategories()])
      .then(([cmsProducts, loadedCategories]) => {
        if (!isMounted) return;
        setCategories(loadedCategories);
        stopWatchdog();
        setProducts(cmsProducts);
        setError(null);
        setLoading(false);
      })
      .catch((cmsError) => {
        if (!isMounted) return;
        const readable = getReadableCmsError(cmsError);
        stopWatchdog();
        console.error("Failed to load products:", readable);
        setError(readable);
        setLoading(false);
      });

    return () => {
      isMounted = false;
      stopWatchdog();
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
