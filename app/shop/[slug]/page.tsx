"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  Heart,
  ShoppingCart,
  Star,
  Package,
  Shield,
  Sparkles,
  ArrowLeft,
  Share2,
  Minus,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { PRODUCTS, TESTIMONIALS } from "../../../constants/constants";
import ProductCard from "../../../components/ProductCard";
import { fadeInUp, staggerContainer } from "../../../utils/animations";
import { useCart } from "../../../context/CartContext";

function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { addToCart } = useCart();

  const product = PRODUCTS.find((p) => p.slug === slug);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFavoriteToast, setShowFavoriteToast] = useState(false);

  // Load favorite status from localStorage
  React.useEffect(() => {
    if (product) {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setIsFavorite(favorites.includes(product.id));
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-earthy-brown mb-4">
            Product Not Found
          </h1>
          <button
            onClick={() => router.push("/shop")}
            className="px-6 py-3 bg-earthy-brown text-white rounded-2xl font-bold hover:bg-rose-400 transition-colors"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  // Mock additional images (in real app, products would have multiple images)
  const productImages = [product.image, product.image, product.image];

  // Related products (same category, excluding current)
  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 3);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleToggleFavorite = () => {
    if (!product) return;

    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const newFavoriteState = !isFavorite;

    if (newFavoriteState) {
      // Add to favorites
      if (!favorites.includes(product.id)) {
        favorites.push(product.id);
      }
    } else {
      // Remove from favorites
      const index = favorites.indexOf(product.id);
      if (index > -1) {
        favorites.splice(index, 1);
      }
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    setIsFavorite(newFavoriteState);

    // Show toast notification
    setShowFavoriteToast(true);
    setTimeout(() => setShowFavoriteToast(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-cozy-cream">
      {/* Favorite Toast Notification */}
      {showFavoriteToast && (
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
              {isFavorite ? "Added to favorites! 💕" : "Removed from favorites"}
            </span>
          </div>
        </motion.div>
      )}

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => router.push("/shop")}
          className="flex items-center gap-2 text-gray-600 hover:text-rose-400 transition-colors group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="font-bold">Back to Shop</span>
        </motion.button>
      </div>

      {/* Main Product Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-[3rem] overflow-hidden shadow-lg border border-gray-100">
              <Image
                src={productImages[selectedImage]}
                alt={product.name}
                width={800}
                height={800}
                className="w-full h-full object-cover"
                priority
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleFavorite}
                className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-colors ${
                  isFavorite
                    ? "bg-rose-400 text-white"
                    : "bg-white text-gray-400"
                }`}
              >
                <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
              </motion.button>

              {/* Category Badge */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-2xl shadow-md">
                <span className="text-sm font-bold text-earthy-brown uppercase tracking-wider">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-3">
              {productImages.map((img, index) => (
                <motion.button
                  key={index}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-rose-400 shadow-md"
                      : "border-gray-200"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} view ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Title & Rating */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-earthy-brown mb-3">
                {product.name}
              </h1>
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
              <p className="text-3xl font-bold text-rose-400">
                ₹{product.price.toFixed(2)}
              </p>
            </div>

            {/* Description */}
            <div className="bg-warm-peach/20 rounded-3xl p-6 border border-warm-peach/30">
              <p className="text-gray-700 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100"
              >
                <Package className="mx-auto text-rose-400 mb-2" size={24} />
                <p className="text-xs font-bold text-gray-700">
                  Handmade with Love
                </p>
              </motion.div>
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100"
              >
                <Shield className="mx-auto text-leaf-green mb-2" size={24} />
                <p className="text-xs font-bold text-gray-700">
                  Quality Guaranteed
                </p>
              </motion.div>
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100"
              >
                <Sparkles
                  className="mx-auto text-sunny-yellow mb-2"
                  size={24}
                />
                <p className="text-xs font-bold text-gray-700">One of a Kind</p>
              </motion.div>
            </div>

            {/* Quantity Selector */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-200">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 rounded-l-2xl transition-colors"
                  >
                    <Minus size={20} className="text-gray-600" />
                  </motion.button>
                  <span className="px-6 font-bold text-lg text-earthy-brown">
                    {quantity}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100 rounded-r-2xl transition-colors"
                  >
                    <Plus size={20} className="text-gray-600" />
                  </motion.button>
                </div>
                <div className="text-sm text-gray-500">
                  Only <span className="font-bold text-rose-400">3 left</span>{" "}
                  in stock!
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="flex-1 bg-earthy-brown text-white font-bold py-4 rounded-2xl hover:bg-rose-400 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                <span>Add to Cart</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="p-4 bg-white border-2 border-gray-200 rounded-2xl hover:border-rose-400 hover:bg-rose-50 transition-colors shadow-sm"
              >
                <Share2 size={20} className="text-gray-600" />
              </motion.button>
            </div>

            {/* Additional Info */}
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
              <button
                onClick={() => router.push("/care")}
                className="text-rose-400 font-bold text-sm mt-3 hover:underline"
              >
                View Full Care Guide →
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-earthy-brown text-center mb-12"
        >
          What Our Customers Say
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {TESTIMONIALS.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={fadeInUp}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="text-sunny-yellow fill-sunny-yellow"
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic leading-relaxed">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <p className="font-bold text-earthy-brown">{testimonial.name}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-earthy-brown text-center mb-12"
          >
            You Might Also Love
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {relatedProducts.map((relatedProduct) => (
              <motion.div
                key={relatedProduct.id}
                variants={fadeInUp}
                onClick={() => router.push(`/shop/${relatedProduct.slug}`)}
              >
                <ProductCard product={relatedProduct} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}
    </div>
  );
}

export default ProductPage;
