"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const phrases = [
  "Warming up the hooks...",
  "Untangling the yarn...",
  "Counting every stitch...",
  "Knitting with love...",
  "Almost cozy...",
];

export default function LoadingScreen() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Cycle through cozy phrases
  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#fffdf7]">
      {/* Ambient Floating Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [-20, 20, -20],
          y: [-20, 50, -20],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#ffdab9]/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [20, -40, 20],
          y: [50, -20, 50],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#f4c2c2]/20 rounded-full blur-3xl"
      />

      <div className="relative flex flex-col items-center">
        {/* Animated SVG Crochet Heart */}
        <svg
          width="120"
          height="120"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          <motion.path
            d="M50 80C50 80 20 60 20 35C20 20 35 15 50 30C65 15 80 20 80 35C80 60 50 80 50 80Z"
            stroke="#8d6e63" // earthy-brown
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="0 1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          {/* The "Hook" following the path */}
          <motion.circle
            r="3"
            fill="#f4c2c2" // soft-rose
            initial={{ offset: 0 }}
            animate={{ offset: 1 }}
            style={{
              offsetPath:
                "path('M50 80C50 80 20 60 20 35C20 20 35 15 50 30C65 15 80 20 80 35C80 60 50 80 50 80Z')",
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>

        {/* Branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-center"
        >
          <h2 className="font-serif text-2xl font-bold text-[#8d6e63] tracking-tight">
            Whiskerknots
          </h2>

          {/* Rotating Phrases */}
          <motion.p
            key={phraseIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="font-sans text-[#8d6e63]/60 text-sm mt-2 italic"
          >
            {phrases[phraseIndex]}
          </motion.p>
        </motion.div>
      </div>

      {/* Soft Progress Bar */}
      {/* <div className="absolute bottom-12 w-48 h-1 bg-stone-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#f4c2c2]"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />
      </div> */}
    </div>
  );
}
