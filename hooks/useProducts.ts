"use client";

import { useContext } from "react";
import {
  ProductsContext,
  ProductsContextValue,
} from "../context/ProductsContext";

export type UseProductsResult = ProductsContextValue;

export const useProducts = (): UseProductsResult => {
  const context = useContext(ProductsContext);

  if (!context) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }

  return context;
};
