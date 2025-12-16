"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Product } from "../types/types";
import { useAuth } from "./AuthContext";

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

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("whiskerknots-cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage:", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Sync cart and favorites with Firebase when user signs in
  useEffect(() => {
    const syncWithFirebase = async () => {
      if (!user || !isHydrated) return;

      try {
        // Get local cart and favorites
        const localCart = JSON.parse(
          localStorage.getItem("whiskerknots-cart") || "[]"
        );
        const localFavorites = JSON.parse(
          localStorage.getItem("favorites") || "[]"
        );

        // Get Firebase data
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const firebaseCart = userData.cart || [];
          const firebaseFavorites = userData.favorites || [];

          // Merge local and firebase data (local takes precedence for cart)
          const mergedCart = [...localCart];
          firebaseCart.forEach((fbItem: CartItem) => {
            const exists = mergedCart.find((item) => item.id === fbItem.id);
            if (!exists) {
              mergedCart.push(fbItem);
            }
          });

          // Merge favorites (remove duplicates)
          const mergedFavorites = [
            ...new Set([...localFavorites, ...firebaseFavorites]),
          ];

          // Update state and localStorage
          setItems(mergedCart);
          localStorage.setItem("whiskerknots-cart", JSON.stringify(mergedCart));
          localStorage.setItem("favorites", JSON.stringify(mergedFavorites));

          // Sync to Firebase
          await setDoc(
            userDocRef,
            {
              cart: mergedCart,
              favorites: mergedFavorites,
            },
            { merge: true }
          );

          // Trigger favorites update event
          window.dispatchEvent(new Event("favoritesChanged"));
        } else {
          // First time user, save local data to Firebase
          await setDoc(
            userDocRef,
            {
              cart: localCart,
              favorites: localFavorites,
            },
            { merge: true }
          );
        }
      } catch (error) {
        console.error("Failed to sync with Firebase:", error);
      }
    };

    syncWithFirebase();
  }, [user, isHydrated]);

  // Save cart to localStorage and Firebase whenever it changes
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("whiskerknots-cart", JSON.stringify(items));

      // Sync to Firebase if user is logged in
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        setDoc(userDocRef, { cart: items }, { merge: true }).catch((error) => {
          console.error("Failed to sync cart to Firebase:", error);
        });
      }
    }
  }, [items, isHydrated, user]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
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
        item.id === productId ? { ...item, quantity } : item
      )
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
