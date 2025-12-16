"use client";
import React from "react";
import { PRODUCTS } from "../../constants/constants";
import ProductCard from "../../components/ProductCard";
import { Product } from "../../types/types";
import { useRouter, useSearchParams } from "next/navigation";
import capitaliseFirstLetter from "@/utils/capitaliseFirstLetter";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";

const Shop: React.FC = () => {
  const router = useRouter();
  const activeCategory = useSearchParams().get("category") || "all";
  const categories = ["all", "amigurumi", "wearables", "decor"];

  const filteredProducts =
    activeCategory === "all"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl font-bold text-earthy-brown mb-4"
        >
          The Shop
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-500 max-w-2xl mx-auto"
        >
          Browse our handmade collection. Every item is unique and made with
          care.
        </motion.p>
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
            onClick={() =>
              router.push(cat === "all" ? "/shop" : `/shop?category=${cat}`)
            }
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

      {/* Grid */}
      {filteredProducts.length > 0 ? (
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredProducts.map((product: Product, index) => (
            <motion.div
              key={product.id}
              variants={fadeInUp}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-20 text-gray-400"
        >
          <p>No cozy items found in this category yet!</p>
        </motion.div>
      )}
    </div>
  );
};

export default Shop;
