"use client";
import Image from "next/image";
import React from "react";
import { Heart, Coffee, Sun } from "lucide-react";
import { motion } from "framer-motion";
import {
  fadeInUp,
  slideInLeft,
  slideInRight,
  staggerContainer,
} from "../../utils/animations";

function Page() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-[3rem] p-8 md:p-16 shadow-sm border border-orange-50 overflow-hidden relative"
      >
        {/* Background blobs */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.7, 0.6] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-64 h-64 bg-yellow-100 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/2 pointer-events-none"
        ></motion.div>
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.7, 0.6] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-0 left-0 w-64 h-64 bg-rose-100 rounded-full blur-3xl opacity-60 translate-y-1/2 -translate-x-1/2 pointer-events-none"
        ></motion.div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" animate="visible" variants={slideInLeft}>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold text-earthy-brown mb-8 leading-tight"
            >
              A Story Woven with <span className="text-rose-400">Passion</span>
            </motion.h1>
            <motion.div
              variants={staggerContainer}
              className="space-y-6 text-gray-600 text-lg leading-relaxed"
            >
              <motion.p variants={fadeInUp}>
                Welcome to <strong>Whiskerknots Crochet</strong>! It all started
                on a rainy Sunday afternoon with a single ball of yarn and a
                crochet hook. What began as a hobby to pass the time quickly
                turned into a deep passion for creating cute, comforting
                tangible objects.
              </motion.p>
              <motion.p variants={fadeInUp}>
                The name &quot;Whiskerknots&quot; comes from my two favorite
                things: my curious cat (who loves to inspect every skein of
                yarn) and the intricate knots that make up this beautiful craft.
              </motion.p>
              <motion.p variants={fadeInUp}>
                Our mission is simple: <strong>Loops of Love</strong>. We
                believe that a handmade gift carries a warmth that mass-produced
                items just can&apos;t match. Whether it&apos;s a plushie for a
                little one or a beanie for a cold day, we want our creations to
                bring a smile to your face.
              </motion.p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12"
            >
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="flex flex-col items-center text-center p-4 bg-orange-50 rounded-2xl"
              >
                <Heart className="text-rose-400 mb-3" size={32} />
                <h4 className="font-bold text-earthy-brown">Handmade</h4>
                <p className="text-sm text-gray-500">100% crafted by hand</p>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="flex flex-col items-center text-center p-4 bg-orange-50 rounded-2xl"
              >
                <Sun className="text-yellow-400 mb-3" size={32} />
                <h4 className="font-bold text-earthy-brown">Quality</h4>
                <p className="text-sm text-gray-500">Premium soft yarn</p>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="flex flex-col items-center text-center p-4 bg-orange-50 rounded-2xl"
              >
                <Coffee className="text-earthy-brown mb-3" size={32} />
                <h4 className="font-bold text-earthy-brown">Cozy</h4>
                <p className="text-sm text-gray-500">Warm vibes only</p>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={slideInRight}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 3 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  width={300}
                  height={400}
                  src="https://picsum.photos/id/1012/300/400"
                  alt="Process"
                  className="rounded-3xl shadow-lg w-full h-64 object-cover transform translate-y-8 rotate-2"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, rotate: -3 }}
                transition={{ duration: 0.3 }}
              >
                <Image
                  width={300}
                  height={400}
                  src="https://picsum.photos/id/1027/300/400"
                  alt="Yarn Collection"
                  className="rounded-3xl shadow-lg w-full h-64 object-cover transform -translate-y-4 -rotate-2"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default Page;
