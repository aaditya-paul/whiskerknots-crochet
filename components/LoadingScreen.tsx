"use client";
import React from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Stitching your cozy experience",
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center bg-cozy-cream/95 backdrop-blur-sm"
    >
      {/* floating ambient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -right-24 w-72 h-72 bg-yellow-200 rounded-full blur-3xl opacity-40"
        />
        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-24 -left-24 w-60 h-60 bg-rose-200 rounded-full blur-3xl opacity-40"
        />
      </div>

      <div className="relative z-10 p-8 bg-white rounded-[2.5rem] shadow-xl border border-gray-100 max-w-md w-full mx-4 flex flex-col items-center gap-6">
        <div className="flex items-center gap-4">
          <motion.div
            aria-hidden
            className="w-28 h-28 rounded-full bg-gradient-to-br from-rose-100 to-warm-peach flex items-center justify-center shadow-md"
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
          >
            {/* yarn ball: concentric strokes */}
            <svg width="92" height="92" viewBox="0 0 92 92" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f4c2c2" />
                  <stop offset="100%" stopColor="#ffdab9" />
                </linearGradient>
              </defs>
              <circle cx="46" cy="46" r="28" fill="url(#g1)" stroke="#eec6c6" strokeWidth="2" />
              <g stroke="#e7a8a8" strokeWidth="2" strokeLinecap="round">
                <path d="M25 40c6-6 18-14 30-8" opacity="0.95" />
                <path d="M30 52c8-8 22-20 34-12" opacity="0.85" />
                <path d="M28 48c10 0 20-2 30-10" opacity="0.8" />
                <path d="M42 30c2 6-2 18-12 24" opacity="0.7" />
              </g>
              <motion.circle
                cx="78"
                cy="14"
                r="4"
                fill="#fff"
                animate={{ rotate: [0, 360] }}
                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
              />
            </svg>
          </motion.div>

          {/* pulsing heart */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0.9 }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.95, 1, 0.95] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Heart size={24} className="text-rose-400" />
            </div>
            <span className="text-xs text-gray-500 mt-2">Made with Loops of Love</span>
          </motion.div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-bold text-earthy-brown">{message}</h3>
          <div className="mt-3 flex items-center justify-center gap-2 h-6">
            <motion.span
              aria-hidden
              className="w-2 h-2 bg-rose-400 rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 0.9, delay: 0 }}
            />
            <motion.span
              aria-hidden
              className="w-2 h-2 bg-rose-300 rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 0.9, delay: 0.15 }}
            />
            <motion.span
              aria-hidden
              className="w-2 h-2 bg-rose-200 rounded-full"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 0.9, delay: 0.3 }}
            />
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center max-w-xs">
          <p>
            We&apos;re loading handmade goodness — small animations to keep you
            company while we prepare the coziest bits for you. Thank you for
            your patience! 🧶
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
