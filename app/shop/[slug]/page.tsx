"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { TESTIMONIALS } from "../../../constants/constants";
import ProductCard from "../../../components/ProductCard";
import ProductDetailView from "../../../components/ProductDetailView";
import { fadeInUp, staggerContainer } from "../../../utils/animations";
import { useProducts } from "../../../hooks/useProducts";

function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { products, loading, error } = useProducts();

  const product = products.find((p) => p.slug === slug);

  if (loading && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-lg rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
            <h1 className="text-2xl font-bold text-red-800 mb-3">
              Couldn&apos;t load this product
            </h1>
            <p className="text-sm text-red-600 mb-6">{error}</p>
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

  // Related products (same category, excluding current)
  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-cozy-cream">
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

      <ProductDetailView product={product} onNavigateCare={() => router.push("/care")} />

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
