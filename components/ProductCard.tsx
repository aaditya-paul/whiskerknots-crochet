"use client";
import React from "react";
import { Plus, Heart } from "lucide-react";
import { Product } from "../types/types";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = React.useState(false);

  React.useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.includes(product.id));
  }, [product.id]);

  const handleCardClick = () => {
    router.push(`/shop/${product.slug}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const newFavoriteState = !isFavorite;

    if (newFavoriteState) {
      if (!favorites.includes(product.id)) {
        favorites.push(product.id);
      }
    } else {
      const index = favorites.indexOf(product.id);
      if (index > -1) {
        favorites.splice(index, 1);
      }
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    setIsFavorite(newFavoriteState);
    window.dispatchEvent(new Event("favoritesChanged"));
  };

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full relative"
    >
      <div className="relative overflow-hidden aspect-square bg-gray-100">
        <Image
          width={500}
          height={500}
          loading="lazy"
          quality={80}
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full shadow-md transition-colors ${
              isFavorite
                ? "bg-rose-400 text-white"
                : "bg-white text-gray-400 hover:text-rose-500"
            }`}
          >
            <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
          </motion.button>
        </div>
        <div className="absolute bottom-0 left-0 bg-white/90 backdrop-blur px-4 py-1 rounded-tr-xl">
          <span className="text-xs font-bold text-earthy-brown uppercase tracking-wider">
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <motion.h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-rose-500 transition-colors">
          {product.name}
        </motion.h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
          {product.description}
        </p>

        <div className="flex font-sans items-center justify-between mt-auto pt-4 border-t border-gray-50">
          <motion.span
            className="text-xl font-bold text-earthy-brown"
            whileHover={{ scale: 1.05 }}
          >
            ₹{product.price.toFixed(2)}
          </motion.span>
          <motion.button
            onClick={handleAddToCart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-orange-100 text-orange-800 hover:bg-orange-200 p-2 rounded-xl transition-colors flex items-center gap-2 px-4 font-bold text-sm"
          >
            <Plus size={16} />
            Add
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
