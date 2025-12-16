"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import { PRODUCTS, TESTIMONIALS } from "../../constants/constants";
import ProductCard from "../../components/ProductCard";
import type { Product, Testimonial } from "../../types/types";
import { useRouter } from "next/navigation";

function Home() {
  const featuredProducts = PRODUCTS.filter((p) => p.isFeatured).slice(0, 3);
  const router = useRouter();

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-warm-peach/20 rounded-[3rem] mt-4 mx-4">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-rose-200 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block py-1 px-3 rounded-full bg-white text-rose-500 text-sm font-bold mb-6 shadow-sm border border-rose-100">
              New Collection Available ✨
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-earthy-brown mb-6 leading-tight">
              Handmade with <br />
              <span className="text-rose-400">Loops of Love</span>
            </h1>
            <p className="text-xl  text-gray-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
              Discover our collection of cozy amigurumi, warm wearables, and
              charming decor. Each stitch creates a story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
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
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <Image
                src="https://picsum.photos/id/1025/300/400"
                alt="Crochet Item"
                width={300}
                height={400}
                className="rounded-3xl shadow-lg transform translate-y-8"
              />
              <Image
                src="https://picsum.photos/id/1074/300/400"
                alt="Crochet Item"
                width={300}
                height={400}
                className="rounded-3xl shadow-lg transform -translate-y-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <button
            onClick={() => router.push("/shop")}
            className="inline-flex items-center gap-2 text-rose-500 font-bold"
          >
            View All <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-sunny-yellow/30 py-20 rounded-[3rem] mx-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t: Testimonial) => (
              <div
                key={t.id}
                className="bg-white p-8 rounded-3xl shadow-sm border border-yellow-100 flex flex-col items-center text-center"
              >
                <p className="text-gray-600 italic mb-6">
                  &quot;{t.text}&quot;
                </p>
                <h4 className="font-bold text-earthy-brown">{t.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
