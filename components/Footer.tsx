"use client";

import React from "react";
import { Instagram, Facebook, Twitter, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const Footer: React.FC = () => {
  const router = useRouter();
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-orange-50 pt-16 pb-8 border-t border-orange-100 mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="col-span-1 md:col-span-1 space-y-4">
            <div className="flex items-center gap-3 ">
              <div className="bg-rose-400 text-white p-2 rounded-full transform group-hover:rotate-12 transition-transform duration-300">
                <Heart size={20} fill="currentColor" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-2xl font-sans font-bold text-earthy-brown tracking-tight">
                  Whiskerknots
                </span>
                <span className="text-xs font-sans text-rose-400 font-medium tracking-widest uppercase">
                  Loops of Love
                </span>
              </div>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Handmade crochet goods crafted with patience, passion, and loops
              of love. Bringing coziness to your world, one stitch at a time.
            </p>
            <div className="flex space-x-4">
              <motion.a
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                href="https://www.instagram.com/whiskerknotscrochet"
                className="bg-white p-2 rounded-full shadow-sm text-rose-400 hover:text-rose-600 hover:shadow-md transition-all"
              >
                <Instagram size={20} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                href="#"
                className="bg-white p-2 rounded-full shadow-sm text-blue-400 hover:text-blue-600 hover:shadow-md transition-all"
              >
                <Facebook size={20} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                href="#"
                className="bg-white p-2 rounded-full shadow-sm text-sky-400 hover:text-sky-600 hover:shadow-md transition-all"
              >
                <Twitter size={20} />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-earthy-brown mb-4">Explore</h4>
            <ul className="space-y-3 text-gray-600">
              <li>
                <button
                  onClick={() => router.push("/shop")}
                  className="hover:text-rose-500 transition-colors cursor-pointer"
                >
                  Shop All
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/shop?category=amigurumi")}
                  className="hover:text-rose-500 transition-colors cursor-pointer"
                >
                  Amigurumi
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/shop?category=wearables")}
                  className="hover:text-rose-500 transition-colors cursor-pointer"
                >
                  Wearables
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/shop?category=decor")}
                  className="hover:text-rose-500 transition-colors cursor-pointer"
                >
                  Home Decor
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-earthy-brown mb-4">Support</h4>
            <ul className="space-y-3 text-gray-600">
              <li>
                <button
                  onClick={() => router.push("/contact")}
                  className="hover:text-rose-500 transition-colors cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/shipping")}
                  className="hover:text-rose-500 transition-colors cursor-pointer"
                >
                  Shipping Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/care")}
                  className="hover:text-rose-500 transition-colors cursor-pointer"
                >
                  Care Instructions
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/returns")}
                  className="hover:text-rose-500 transition-colors cursor-pointer"
                >
                  Returns
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-earthy-brown mb-4">Join the Club</h4>
            <p className="text-gray-600 mb-4 text-sm">
              Get 10% off your first order and exclusive access to new drops!
            </p>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
              />
              <button className="bg-rose-400 text-white font-bold py-2 rounded-xl hover:bg-rose-500 transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-orange-200 pt-8 text-center text-gray-500 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Whiskerknots Crochet. All rights
            reserved.
          </p>
          <p className="mt-2 font-bold font-sans">
            Made with lots of{" "}
            <Heart size={14} className="inline-block text-rose-400" /> and yarn
            🧶
          </p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
