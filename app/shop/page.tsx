"use client";
import React, { useMemo } from "react";
import { PRODUCTS } from "../../constants/constants";
import ProductCard from "../../components/ProductCard";
import { Product } from "../../types/types";
import { useRouter, useSearchParams } from "next/navigation";
import capitaliseFirstLetter from "@/utils/capitaliseFirstLetter";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import NotFound from "../not-found";

const Shop: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Extract the category from URL
  const activeCategory = searchParams.get("category") || "all";
  const categories = ["all", "amigurumi", "wearables", "decor"];

  // 2. Derived filtered products based on active category
  const filteredProducts = useMemo<Product[]>(() => {
    if (activeCategory === "all") {
      return PRODUCTS;
    }
    return PRODUCTS.filter(
      (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [activeCategory]);

  if (!categories.includes(activeCategory)) {
    return <NotFound />;
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-earthy-brown mb-4">The Shop</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Browse our handmade collection. Every item is unique and made with
          care.
        </p>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="flex flex-wrap justify-center gap-4 mb-12"
      >
        {categories.map((cat) => (
          <motion.button
            key={cat}
            variants={fadeInUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // Using router.push updates the searchParams, which triggers our useEffect
              router.push(cat === "all" ? "/shop" : `/shop?category=${cat}`);
            }}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeCategory === cat
                ? "bg-rose-400 text-white shadow-md transform scale-105"
                : "bg-white text-gray-600 hover:bg-rose-50 border border-gray-100"
            }`}
          >
            {capitaliseFirstLetter(cat)}
          </motion.button>
        ))}
      </motion.div>

      {/* Grid with AnimatePresence for smooth transitions */}
      <div className="min-h-100">
        {filteredProducts.length > 0 ? (
          <motion.div
            layout // Added layout prop for smooth grid reshuffling
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product: Product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 text-gray-400"
          >
            <p>No cozy items found in this category yet!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Shop;
