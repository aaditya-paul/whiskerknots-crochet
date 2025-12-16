"use client";
import React, { useState } from "react";
import { PRODUCTS } from "../../constants/constants";
import ProductCard from "../../components/ProductCard";
import { Product } from "../../types/types";

const Shop: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Amigurumi", "Wearables", "Decor"];

  const filteredProducts =
    activeCategory === "All"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-earthy-brown mb-4">The Shop</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Browse our handmade collection. Every item is unique and made with
          care.
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeCategory === cat
                ? "bg-rose-400 text-white shadow-md transform scale-105"
                : "bg-white text-gray-600 hover:bg-rose-50 border border-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p>No cozy items found in this category yet!</p>
        </div>
      )}
    </div>
  );
};

export default Shop;
