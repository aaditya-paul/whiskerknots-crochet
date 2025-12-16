"use client";
import React, { useState, useEffect } from "react";
import { X, Heart, ShoppingCart, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PRODUCTS } from "../constants/constants";
import { Product } from "../types/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";

const FavoritesDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const router = useRouter();
  const { addToCart } = useCart();

  useEffect(() => {
    const loadFavorites = () => {
      const favoriteIds = JSON.parse(localStorage.getItem("favorites") || "[]");
      const favoriteProducts = PRODUCTS.filter((product) =>
        favoriteIds.includes(product.id)
      );
      setFavorites(favoriteProducts);
    };

    loadFavorites();

    const handleFavoritesChanged = () => {
      loadFavorites();
    };

    const handleOpenFavorites = () => {
      setIsOpen(true);
    };

    window.addEventListener("favoritesChanged", handleFavoritesChanged);
    window.addEventListener("openFavorites", handleOpenFavorites);

    return () => {
      window.removeEventListener("favoritesChanged", handleFavoritesChanged);
      window.removeEventListener("openFavorites", handleOpenFavorites);
    };
  }, []);

  const handleRemoveFavorite = (productId: string) => {
    const favoriteIds = JSON.parse(localStorage.getItem("favorites") || "[]");
    const updatedFavorites = favoriteIds.filter(
      (id: string) => id !== productId
    );
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    setFavorites(favorites.filter((product) => product.id !== productId));
    window.dispatchEvent(new Event("favoritesChanged"));
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  const handleProductClick = (slug: string) => {
    setIsOpen(false);
    router.push(`/shop/${slug}`);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full sm:w-[450px] bg-cozy-cream shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="bg-white border-b border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Heart className="text-rose-400 fill-rose-400" size={24} />
                    <h2 className="text-2xl font-bold text-earthy-brown">
                      Favorites
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={24} className="text-gray-600" />
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  {favorites.length} {favorites.length === 1 ? "item" : "items"}
                </p>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {favorites.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="bg-rose-50 p-8 rounded-full mb-6">
                      <Heart size={64} className="text-rose-300" />
                    </div>
                    <h3 className="text-xl font-bold text-earthy-brown mb-2">
                      No favorites yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start adding items you love to your favorites!
                    </p>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/shop");
                      }}
                      className="px-6 py-3 bg-earthy-brown text-white rounded-2xl font-bold hover:bg-rose-400 transition-colors"
                    >
                      Browse Shop
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {favorites.map((product) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-4">
                          <div
                            onClick={() => handleProductClick(product.slug)}
                            className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
                          >
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={96}
                              height={96}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3
                              onClick={() => handleProductClick(product.slug)}
                              className="font-bold text-earthy-brown mb-1 cursor-pointer hover:text-rose-400 transition-colors"
                            >
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                              {product.description}
                            </p>
                            <p className="text-lg font-bold text-rose-400">
                              ₹{product.price.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleAddToCart(product)}
                            className="flex-1 bg-earthy-brown text-white py-2 rounded-xl font-bold hover:bg-rose-400 transition-colors flex items-center justify-center gap-2"
                          >
                            <ShoppingCart size={16} />
                            <span>Add to Cart</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleRemoveFavorite(product.id)}
                            className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {favorites.length > 0 && (
                <div className="bg-white border-t border-gray-200 p-6">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      router.push("/shop");
                    }}
                    className="w-full py-3 bg-white border-2 border-earthy-brown text-earthy-brown rounded-2xl font-bold hover:bg-earthy-brown hover:text-white transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FavoritesDrawer;
