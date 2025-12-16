"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import { PRODUCTS, TESTIMONIALS } from "../../constants/constants";
import ProductCard from "../../components/ProductCard";
import type { Product, Testimonial } from "../../types/types";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fadeInUp, fadeIn, slideInLeft, slideInRight, staggerContainer, floatAnimation } from "../../utils/animations";

function Home() {
  const featuredProducts = PRODUCTS.filter((p) => p.isFeatured).slice(0, 3);
  const router = useRouter();

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-warm-peach/20 rounded-[3rem] mt-4 mx-4">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.6, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-50 pointer-events-none"
        ></motion.div>
        <motion.div 
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.6, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-rose-200 rounded-full blur-3xl opacity-50 pointer-events-none"
        ></motion.div>

        <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={slideInLeft}
            className="flex-1 text-center md:text-left"
          >
            <motion.span 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block py-1 px-3 rounded-full bg-white text-rose-500 text-sm font-bold mb-6 shadow-sm border border-rose-100"
            >
              New Collection Available ✨
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold text-earthy-brown mb-6 leading-tight"
            >
              Handmade with <br />
              <span className="text-rose-400">Loops of Love</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl  text-gray-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed"
            >
              Discover our collection of cozy amigurumi, warm wearables, and
              charming decor. Each stitch creates a story.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            >
              <button
                onClick={() => {
                  router.push("/shop");
                }}
                className="px-8 py-4 bg-earthy-brown text-white rounded-2xl font-bold text-lg hover:bg-rose-400 transition-colors shadow-lg hover:shadow-xl"
              >
                Shop Now
              </button>
              <button
                onClick={() => router.push("/about")}
                className="px-8 py-4 bg-white text-earthy-brown border border-stone-200 rounded-2xl font-bold text-lg hover:bg-stone-50 transition-colors"
              >
                Our Story
              </button>
            </motion.div>
          </motion.div>
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={slideInRight}
            className="flex-1 relative"
          >
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <motion.div
                animate={floatAnimation}
                transition={{ delay: 0 }}
              >
                <Image
                  src="https://picsum.photos/id/1025/300/400"
                  alt="Crochet Item"
                  width={300}
                  height={400}
                  className="rounded-3xl shadow-lg transform translate-y-8"
                />
              </motion.div>
              <motion.div
                animate={floatAnimation}
                transition={{ delay: 0.5 }}
              >
                <Image
                  src="https://picsum.photos/id/1074/300/400"
                  alt="Crochet Item"
                  width={300}
                  height={400}
                  className="rounded-3xl shadow-lg transform -translate-y-8"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <motion.div 
          variants={fadeInUp}
          className="flex justify-between items-end mb-10"
        >
          <div>
            <h2 className="text-3xl font-bold text-earthy-brown mb-2">
              Favorites
            </h2>
            <p className="text-gray-500">Most loved by our community</p>
          </div>
          <button
            onClick={() => router.push("/shop")}
            className="hidden md:flex items-center gap-2 text-rose-500 font-bold hover:gap-3 transition-all"
          >
            View All <ArrowRight size={20} />
          </button>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {featuredProducts.map((product: Product, index) => (
            <motion.div
              key={product.id}
              variants={fadeInUp}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          variants={fadeIn}
          className="mt-8 text-center md:hidden"
        >
          <button
            onClick={() => router.push("/shop")}
            className="inline-flex items-center gap-2 text-rose-500 font-bold"
          >
            View All <ArrowRight size={20} />
          </button>
        </motion.div>
      </motion.section>

      {/* Testimonials */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeIn}
        className="bg-sunny-yellow/30 py-20 rounded-[3rem] mx-4"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-earthy-brown mb-4">
              Happy Customers
            </h2>
            <div className="flex justify-center gap-1 text-yellow-400">
              <Star fill="currentColor" size={24} />
              <Star fill="currentColor" size={24} />
              <Star fill="currentColor" size={24} />
              <Star fill="currentColor" size={24} />
              <Star fill="currentColor" size={24} />
            </div>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {TESTIMONIALS.map((t: Testimonial) => (
              <motion.div
                key={t.id}
                variants={fadeInUp}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-yellow-100 flex flex-col items-center text-center"
              >
                <p className="text-gray-600 italic mb-6">
                  &quot;{t.text}&quot;
                </p>
                <h4 className="font-bold text-earthy-brown">{t.name}</h4>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}

export default Home;
