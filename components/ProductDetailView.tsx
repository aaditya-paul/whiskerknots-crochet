"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Star,
  Package,
  Shield,
  Sparkles,
  Share2,
  Minus,
  Plus,
} from "lucide-react";
import { Product } from "@/types/types";
import { useCart } from "@/context/CartContext";
import {
  DEFAULT_PRODUCT_IMAGE_URL,
  getProductGalleryImages,
  isUnoptimizedImageUrl,
} from "@/utils/productImages";

type ProductDetailViewProps = {
  product: Product;
  previewMode?: boolean;
  onNavigateCare?: () => void;
};

const formatVariantAttributes = (attributes: Record<string, string>) =>
  Object.entries(attributes)
    .filter(([key, value]) => key && value)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" | ");

export default function ProductDetailView({
  product,
  previewMode = false,
  onNavigateCare,
}: ProductDetailViewProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFavoriteToast, setShowFavoriteToast] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (previewMode) return;

    const syncFavoriteState = () => {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setIsFavorite(Array.isArray(favorites) && favorites.includes(product.id));
    };

    syncFavoriteState();
    window.addEventListener("favoritesChanged", syncFavoriteState);

    return () => {
      window.removeEventListener("favoritesChanged", syncFavoriteState);
    };
  }, [previewMode, product.id]);

  const productImages = getProductGalleryImages(product).slice(0, 5);
  const selectedImageSrc =
    productImages[selectedImage] && !failedImages[productImages[selectedImage]]
      ? productImages[selectedImage]
      : DEFAULT_PRODUCT_IMAGE_URL;

  const stockStatus = product.inStock
    ? product.trackQuantity && typeof product.quantity === "number"
      ? `${product.quantity} available`
      : "In stock"
    : product.allowBackorder
      ? "Available on backorder"
      : "Out of stock";

  const handleAddToCart = () => {
    if (previewMode) return;
    addToCart(product, quantity);
  };

  const handleToggleFavorite = () => {
    if (previewMode) return;

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
    setShowFavoriteToast(true);
    setTimeout(() => setShowFavoriteToast(false), 2000);
  };

  const handleShare = async () => {
    if (previewMode) return;

    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: product.description || product.shortDescription || "",
        url: window.location.href,
      });
      return;
    }

    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  return (
    <>
      {showFavoriteToast && !previewMode && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-white shadow-2xl rounded-2xl px-6 py-4 border-2 border-rose-400"
        >
          <div className="flex items-center gap-3">
            <Heart
              size={20}
              className={`${
                isFavorite ? "text-rose-400 fill-rose-400" : "text-gray-400"
              }`}
            />
            <span className="font-bold text-earthy-brown">
              {isFavorite ? "Added to favorites!" : "Removed from favorites"}
            </span>
          </div>
        </motion.div>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="relative aspect-square bg-white rounded-[3rem] overflow-hidden shadow-lg border border-gray-100">
              <Image
                src={selectedImageSrc}
                alt={product.name}
                width={800}
                height={800}
                unoptimized={isUnoptimizedImageUrl(selectedImageSrc)}
                onError={() =>
                  setFailedImages((current) => ({
                    ...current,
                    [productImages[selectedImage]]: true,
                  }))
                }
                className="w-full h-full object-cover"
                priority
              />
              <motion.button
                whileHover={{ scale: previewMode ? 1 : 1.1 }}
                whileTap={{ scale: previewMode ? 1 : 0.95 }}
                onClick={handleToggleFavorite}
                className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-colors ${
                  isFavorite
                    ? "bg-rose-400 text-white"
                    : "bg-white text-gray-400"
                }`}
                disabled={previewMode}
              >
                <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
              </motion.button>

              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-2xl shadow-md">
                <span className="text-sm font-bold text-earthy-brown uppercase tracking-wider">
                  {product.category?.name ?? "Uncategorized"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-3">
              {productImages.map((img, index) => (
                <motion.button
                  key={index}
                  whileHover={{ y: previewMode ? 0 : -4 }}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-full aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-rose-400 shadow-md"
                      : "border-gray-200"
                  }`}
                >
                  <Image
                    src={failedImages[img] ? DEFAULT_PRODUCT_IMAGE_URL : img}
                    alt={`${product.name} view ${index + 1}`}
                    width={80}
                    height={80}
                    unoptimized={isUnoptimizedImageUrl(img)}
                    onError={() =>
                      setFailedImages((current) => ({
                        ...current,
                        [img]: true,
                      }))
                    }
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-earthy-brown mb-3">
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="text-lg text-gray-600 mb-4">
                  {product.shortDescription}
                </p>
              )}
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className="text-sunny-yellow fill-sunny-yellow"
                  />
                ))}
                <span className="text-gray-600 ml-2">(24 reviews)</span>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-3xl font-bold text-rose-400">
                  ₹{product.price.toFixed(2)}
                </p>
                {typeof product.compareAtPrice === "number" &&
                  product.compareAtPrice > product.price && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        ₹{product.compareAtPrice.toFixed(2)}
                      </span>
                      <span className="text-sm font-bold text-emerald-600">
                        Save ₹
                        {(product.compareAtPrice - product.price).toFixed(2)}
                      </span>
                    </>
                  )}
              </div>
            </div>

            <div className="bg-warm-peach/20 rounded-3xl p-6 border border-warm-peach/30 space-y-2">
              <p className="text-gray-700 text-lg leading-relaxed">
                {product.description || "No description added yet."}
              </p>
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-earthy-brown border border-warm-peach/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <motion.div
                whileHover={{ y: previewMode ? 0 : -4 }}
                className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100"
              >
                <Package className="mx-auto text-rose-400 mb-2" size={24} />
                <p className="text-xs font-bold text-gray-700">
                  Handmade with Love
                </p>
              </motion.div>
              <motion.div
                whileHover={{ y: previewMode ? 0 : -4 }}
                className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100"
              >
                <Shield className="mx-auto text-leaf-green mb-2" size={24} />
                <p className="text-xs font-bold text-gray-700">
                  Quality Guaranteed
                </p>
              </motion.div>
              <motion.div
                whileHover={{ y: previewMode ? 0 : -4 }}
                className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100"
              >
                <Sparkles
                  className="mx-auto text-sunny-yellow mb-2"
                  size={24}
                />
                <p className="text-xs font-bold text-gray-700">One of a Kind</p>
              </motion.div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-200">
                  <motion.button
                    whileTap={{ scale: previewMode ? 1 : 0.9 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 rounded-l-2xl transition-colors"
                    disabled={previewMode}
                  >
                    <Minus size={20} className="text-gray-600" />
                  </motion.button>
                  <span className="px-6 font-bold text-lg text-earthy-brown">
                    {quantity}
                  </span>
                  <motion.button
                    whileTap={{ scale: previewMode ? 1 : 0.9 }}
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100 rounded-r-2xl transition-colors"
                    disabled={previewMode}
                  >
                    <Plus size={20} className="text-gray-600" />
                  </motion.button>
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-bold text-rose-400">{stockStatus}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: previewMode ? 1 : 1.02 }}
                whileTap={{ scale: previewMode ? 1 : 0.98 }}
                onClick={handleAddToCart}
                className="flex-1 bg-earthy-brown text-white font-bold py-4 rounded-2xl hover:bg-rose-400 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                disabled={previewMode}
              >
                <ShoppingCart size={20} />
                <span>
                  {previewMode ? "Add to Cart (Preview)" : "Add to Cart"}
                </span>
              </motion.button>
              <motion.button
                whileHover={{ scale: previewMode ? 1 : 1.05 }}
                whileTap={{ scale: previewMode ? 1 : 0.95 }}
                onClick={handleShare}
                className="p-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-rose-400 hover:bg-rose-50 transition-colors shadow-sm"
                disabled={previewMode}
              >
                <Share2 size={20} className="text-gray-600" />
              </motion.button>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
              <h3 className="font-bold text-earthy-brown">Product Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-500">SKU:</span>{" "}
                  {product.sku || "Not specified"}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-500">Barcode:</span>{" "}
                  {product.barcode || "Not specified"}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-500">Category:</span>{" "}
                  {product.category?.name || "Uncategorized"}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-500">Status:</span>{" "}
                  {product.status}
                </p>
                {typeof product.weight === "number" && (
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-500">Weight:</span>{" "}
                    {product.weight} {product.weightUnit || "g"}
                  </p>
                )}
                {(typeof product.length === "number" ||
                  typeof product.width === "number" ||
                  typeof product.height === "number") && (
                  <p className="text-gray-700">
                    <span className="font-semibold text-gray-500">
                      Dimensions:
                    </span>{" "}
                    {product.length ?? "-"} x {product.width ?? "-"} x{" "}
                    {product.height ?? "-"} {product.dimensionUnit || "cm"}
                  </p>
                )}
              </div>
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
                <h3 className="font-bold text-earthy-brown">
                  Available Variants
                </h3>
                <div className="space-y-2">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="rounded-xl border border-gray-200 px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-gray-800">
                          {variant.name}
                        </p>
                        <p className="text-sm text-rose-500 font-semibold">
                          {typeof variant.price === "number"
                            ? `₹${variant.price.toFixed(2)}`
                            : "Uses base price"}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {variant.inStock ? "In stock" : "Out of stock"}
                        {typeof variant.quantity === "number"
                          ? ` | Qty: ${variant.quantity}`
                          : ""}
                      </p>
                      {Object.keys(variant.attributes || {}).length > 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                          {formatVariantAttributes(variant.attributes)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {product.customFields &&
              Object.keys(product.customFields).length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-2">
                  <h3 className="font-bold text-earthy-brown">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {Object.entries(product.customFields).map(
                      ([key, value]) => (
                        <p key={key} className="text-gray-700">
                          <span className="font-semibold text-gray-500">
                            {key}:
                          </span>{" "}
                          {String(value)}
                        </p>
                      ),
                    )}
                  </div>
                </div>
              )}

            <div className="bg-leaf-green/10 rounded-2xl p-6 border border-leaf-green/30">
              <h3 className="font-bold text-earthy-brown mb-3 flex items-center gap-2">
                <Sparkles size={18} className="text-leaf-green" />
                Care Instructions
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">•</span>
                  <span>Hand wash in cool water with mild detergent</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">•</span>
                  <span>Lay flat to dry, away from direct sunlight</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">•</span>
                  <span>Do not bleach or iron</span>
                </li>
              </ul>
              {onNavigateCare && !previewMode && (
                <button
                  onClick={onNavigateCare}
                  className="text-rose-400 font-bold text-sm mt-3 hover:underline"
                >
                  View Full Care Guide →
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
