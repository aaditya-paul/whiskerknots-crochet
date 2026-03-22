"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { dbUserState, getReadableDbError } from "../lib/db";
import { Product } from "../types/types";
import { useAuth } from "./AuthContext";
import { fetchProducts } from "../services/productCmsService";
import {
  sanitizeCartItems,
  sanitizeFavoriteIds,
} from "../utils/storeIntegrity";

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const isInitialRemoteSyncInFlightRef = useRef(false);
  const hasCompletedInitialRemoteSyncRef = useRef(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("whiskerknots-cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        setItems(sanitizeCartItems(parsed));
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage:", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    let cancelled = false;

    const reconcileWithActiveCatalog = async () => {
      try {
        const activeProducts = await fetchProducts();
        if (cancelled) return;

        const productsById = new Map(
          activeProducts.map((product) => [product.id, product]),
        );

        setItems((prevItems) => {
          const sanitizedItems = sanitizeCartItems(prevItems, productsById);
          return JSON.stringify(sanitizedItems) === JSON.stringify(prevItems)
            ? prevItems
            : sanitizedItems;
        });

        const rawFavorites = JSON.parse(
          localStorage.getItem("favorites") || "[]",
        );
        const sanitizedFavorites = sanitizeFavoriteIds(
          rawFavorites,
          activeProducts,
        );

        if (
          JSON.stringify(rawFavorites) !== JSON.stringify(sanitizedFavorites)
        ) {
          localStorage.setItem("favorites", JSON.stringify(sanitizedFavorites));
          window.dispatchEvent(new Event("favoritesChanged"));
        }
      } catch (error) {
        console.error(
          "Failed to reconcile cart/favorites with active catalog:",
          error,
        );
      }
    };

    void reconcileWithActiveCatalog();

    return () => {
      cancelled = true;
    };
  }, [isHydrated]);

  // Sync cart and favorites with Supabase when user signs in
  useEffect(() => {
    const syncWithSupabase = async () => {
      if (!user || !isHydrated || isInitialRemoteSyncInFlightRef.current) {
        return;
      }

      isInitialRemoteSyncInFlightRef.current = true;
      hasCompletedInitialRemoteSyncRef.current = false;

      try {
        // Small delay to allow session to fully initialize after signup
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Get local cart and favorites
        const localCart = JSON.parse(
          localStorage.getItem("whiskerknots-cart") || "[]",
        );
        const localFavoritesRaw = JSON.parse(
          localStorage.getItem("favorites") || "[]",
        );
        const activeProducts = await fetchProducts();
        const productsById = new Map(
          activeProducts.map((product) => [product.id, product]),
        );

        const localCartSanitized = sanitizeCartItems(localCart, productsById);
        const localFavorites = sanitizeFavoriteIds(
          localFavoritesRaw,
          activeProducts,
        );

        const remoteState = await dbUserState.fetchByUserId(user.uid);

        if (remoteState) {
          const remoteCart = Array.isArray(remoteState.cart)
            ? (remoteState.cart as CartItem[])
            : [];
          const remoteFavorites = Array.isArray(remoteState.favorites)
            ? (remoteState.favorites as string[])
            : [];

          // Merge local and remote data (local takes precedence for cart)
          const mergedCart = [...localCartSanitized];
          remoteCart.forEach((remoteItem: CartItem) => {
            const exists = mergedCart.find((item) => item.id === remoteItem.id);
            if (!exists) {
              mergedCart.push(remoteItem);
            }
          });
          const sanitizedMergedCart = sanitizeCartItems(
            mergedCart,
            productsById,
          );

          // Merge favorites (remove duplicates)
          const mergedFavorites = sanitizeFavoriteIds(
            [...new Set([...localFavorites, ...remoteFavorites])],
            activeProducts,
          );

          // Update state and localStorage
          setItems(sanitizedMergedCart);
          localStorage.setItem(
            "whiskerknots-cart",
            JSON.stringify(sanitizedMergedCart),
          );
          localStorage.setItem("favorites", JSON.stringify(mergedFavorites));

          await dbUserState.upsert({
            userId: user.uid,
            cart: sanitizedMergedCart,
            favorites: mergedFavorites,
          });

          // Trigger favorites update event
          window.dispatchEvent(new Event("favoritesChanged"));
        } else {
          // No remote row - create one with local data
          setItems(localCartSanitized);
          localStorage.setItem(
            "whiskerknots-cart",
            JSON.stringify(localCartSanitized),
          );
          localStorage.setItem("favorites", JSON.stringify(localFavorites));

          await dbUserState.upsert({
            userId: user.uid,
            cart: localCartSanitized,
            favorites: localFavorites,
          });

          window.dispatchEvent(new Event("favoritesChanged"));
        }
      } catch (error) {
        const errorMsg = getReadableDbError(error);
        if (
          typeof errorMsg === "string" &&
          errorMsg.includes("row-level security")
        ) {
          console.warn(
            "Session may not be fully initialized. Cart sync will retry on next update.",
            error,
          );
        } else {
          console.error("Failed to sync cart/favorites with Supabase:", error);
        }
      } finally {
        isInitialRemoteSyncInFlightRef.current = false;
        hasCompletedInitialRemoteSyncRef.current = true;
      }
    };

    syncWithSupabase();

    if (!user) {
      isInitialRemoteSyncInFlightRef.current = false;
      hasCompletedInitialRemoteSyncRef.current = false;
    }
  }, [user, isHydrated]);

  // Save cart to localStorage and Supabase whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("whiskerknots-cart", JSON.stringify(items));

      // Sync to Supabase if user is logged in
      if (
        user &&
        hasCompletedInitialRemoteSyncRef.current &&
        !isInitialRemoteSyncInFlightRef.current
      ) {
        dbUserState
          .upsert({
            userId: user.uid,
            cart: items,
          })
          .catch((error) => {
            console.error(
              "Failed to sync cart to Supabase:",
              getReadableDbError(error),
              error,
            );
          });
      }
    }
  }, [items, isHydrated, user]);

  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.status !== "active") {
      return;
    }

    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prevItems, { ...product, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getCartTotal = () => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
