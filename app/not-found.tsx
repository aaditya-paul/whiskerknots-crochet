"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MoveLeft, Scissors } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fffdf7] flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Background "Tangle" - Large blurred blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-[#ffdab9]/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-[#f4c2c2]/20 rounded-full blur-[100px]"
        />
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        {/* Animated 404 Header */}
        <div className="relative inline-block">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif text-[12rem] leading-none font-bold text-[#8d6e63]/10 select-none"
          >
            404
          </motion.h1>

          {/* The "Dropped Stitch" Yarn Ball */}
          <motion.div
            drag
            dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
            whileHover={{ scale: 1.1 }}
            className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            <div className="bg-[#f4c2c2] w-32 h-32 rounded-full shadow-xl flex items-center justify-center relative border-4 border-[#fffdf7]">
              {/* Yarn lines texture */}
              <div className="absolute inset-0 rounded-full border-t-2 border-white/30 rotate-12 m-4" />
              <div className="absolute inset-0 rounded-full border-r-2 border-white/30 -rotate-45 m-6" />
              <Scissors className="text-white w-10 h-10 opacity-80" />
            </div>
          </motion.div>
        </div>

        {/* Messaging */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 space-y-4"
        >
          <h2 className="font-serif text-4xl text-[#8d6e63] font-bold">
            Oh knit! A dropped stitch.
          </h2>
          <p className="font-sans text-[#2f2e33]/70 text-lg max-w-md mx-auto">
            It looks like this page has unraveled. Don't worry, we can wind
            everything back up together.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#8d6e63] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-brown-900/20"
            >
              <MoveLeft size={20} />
              Back to the Shop
            </motion.button>
          </Link>

          <Link href="/shop">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "#fff59d" }}
              className="bg-white border-2 border-[#8d6e63]/10 text-[#8d6e63] px-8 py-4 rounded-2xl font-bold transition-colors"
            >
              Browse New Loops
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Decorative Floating Thread */}
      <svg className="absolute bottom-0 left-0 w-full h-32 pointer-events-none overflow-visible">
        <motion.path
          d="M0 50 Q 250 120 500 50 T 1000 50 T 1500 50"
          fill="none"
          stroke="#f4c2c2"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
