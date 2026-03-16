"use client";
import React, { useMemo } from "react";
import ProductCard from "../../components/ProductCard";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";
import { useProducts } from "../../hooks/useProducts";

const Shop: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, categories: dbCategories, loading, error } = useProducts();

  const activeCategory = searchParams.get("category") || "all";

  // Build ["all", ...category slugs from DB]
  const categorySlugs = useMemo(
    () => ["all", ...dbCategories.map((c) => c.slug)],
    [dbCategories],
  );

  // Filter products by active category slug
  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products;
    return products.filter((p) => p.category?.slug === activeCategory);
  }, [activeCategory, products]);

  // Display name for a category slug
  const labelFor = (slug: string) => {
    if (slug === "all") return "All";
    return dbCategories.find((c) => c.slug === slug)?.name ?? slug;
  };

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

      {/* Category filter pills */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="flex flex-wrap justify-center gap-4 mb-12"
      >
        {categorySlugs.map((slug) => (
          <motion.button
            key={slug}
            variants={fadeInUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              router.push(slug === "all" ? "/shop" : `/shop?category=${slug}`)
            }
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeCategory === slug
                ? "bg-rose-400 text-white shadow-md scale-105"
                : "bg-white text-gray-600 hover:bg-rose-50 border border-gray-100"
            }`}
          >
            {labelFor(slug)}
          </motion.button>
        ))}
      </motion.div>

      {/* Product grid */}
      <div className="min-h-100">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-rose-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700"
          >
            <p className="font-semibold">We couldn&apos;t load the products.</p>
            <p className="mt-2 text-sm text-red-600">{error}</p>
          </motion.div>
        ) : filteredProducts.length > 0 ? (
          <motion.div
            layout
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
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
