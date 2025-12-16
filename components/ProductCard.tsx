import React from "react";
import { Plus, Heart } from "lucide-react";
import { Product } from "../types/types";
import Image from "next/image";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full relative">
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
          <button className="bg-white p-2 rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors">
            <Heart size={20} />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 bg-white/90 backdrop-blur px-4 py-1 rounded-tr-xl">
          <span className="text-xs font-bold text-earthy-brown uppercase tracking-wider">
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-rose-500 transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
          {product.description}
        </p>

        <div className="flex font-sans items-center justify-between mt-auto pt-4 border-t border-gray-50">
          <span className="text-xl font-bold text-earthy-brown">
            ₹{product.price.toFixed(2)}
          </span>
          <button className="bg-orange-100 text-orange-800 hover:bg-orange-200 p-2 rounded-xl transition-colors flex items-center gap-2 px-4 font-bold text-sm">
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
