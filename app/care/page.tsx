"use client";
import React from "react";
import {
  Droplets,
  Wind,
  Sun,
  Heart,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";

function CareInstructions() {
  const careSteps = [
    {
      icon: <Droplets size={32} />,
      title: "Gentle Hand Washing",
      description:
        "Fill a basin with cool or lukewarm water and add a mild detergent. Gently swish your item around (no wringing!) and let it soak for 10-15 minutes.",
      color: "bg-blue-100",
      iconColor: "text-blue-500",
    },
    {
      icon: <Wind size={32} />,
      title: "Rinse with Care",
      description:
        "Drain the soapy water and rinse thoroughly with clean water until all detergent is removed. Press gently to remove excess water—never twist or wring!",
      color: "bg-sky-100",
      iconColor: "text-sky-500",
    },
    {
      icon: <Sun size={32} />,
      title: "Air Dry Flat",
      description:
        "Lay your item flat on a clean towel, reshape it gently, and let it air dry away from direct sunlight and heat. Flip it over halfway through drying.",
      color: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      icon: <Heart size={32} />,
      title: "Store with Love",
      description:
        "Once completely dry, store your item in a cool, dry place. Fold it gently rather than hanging to maintain its shape. Add lavender sachets for freshness!",
      color: "bg-rose-100",
      iconColor: "text-rose-500",
    },
  ];

  const itemSpecificCare = [
    {
      category: "Amigurumi & Plushies",
      icon: "🧸",
      tips: [
        "Spot clean with a damp cloth when possible",
        "For deep cleaning, place in a pillowcase before machine washing (delicate cycle)",
        "Avoid washing items with plastic safety eyes too frequently",
        "Air dry completely to prevent mildew in stuffing",
      ],
    },
    {
      category: "Wearables (Hats, Scarves, Gloves)",
      icon: "🧣",
      tips: [
        "Hand wash in cool water to preserve shape",
        "Block to original dimensions after washing",
        "Store flat or loosely rolled to prevent stretching",
        "Avoid direct contact with perfumes or deodorants",
      ],
    },
    {
      category: "Blankets & Home Decor",
      icon: "🏠",
      tips: [
        "Machine wash on gentle cycle in cold water (if care tag allows)",
        "Use a mesh laundry bag for delicate items",
        "Tumble dry on low heat or air dry flat",
        "Steam lightly to remove wrinkles instead of ironing",
      ],
    },
  ];

  const donts = [
    "Don't use bleach or harsh chemicals",
    "Don't wring or twist wet items",
    "Don't hang heavy items while wet (they'll stretch)",
    "Don't use high heat when drying",
    "Don't iron directly on crochet (use steam or a pressing cloth)",
  ];

  return (
    <div className="min-h-screen bg-cozy-cream">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-rose-50 rounded-[3rem] mt-4 mx-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.5, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-40 pointer-events-none"
        ></motion.div>
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.5, 0.4] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-pink-200 rounded-full blur-3xl opacity-40 pointer-events-none"
        ></motion.div>

        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-block p-3 bg-white rounded-full shadow-sm mb-6"
          >
            <Sparkles className="text-rose-400" size={40} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold text-earthy-brown mb-6"
          >
            Care Instructions
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Your handmade treasures deserve a little TLC! Follow these simple
            steps to keep your crochet items cozy and beautiful for years to
            come. 🧶
          </motion.p>
        </div>
      </section>

      {/* Main Care Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-earthy-brown text-center mb-12"
        >
          General Care Guide
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {careSteps.map((step, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100"
            >
              <div
                className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mb-6 ${step.iconColor}`}
              >
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold text-earthy-brown mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Item-Specific Care */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-warm-peach/10 rounded-[3rem] mx-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-earthy-brown text-center mb-12"
        >
          Item-Specific Tips
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {itemSpecificCare.map((item, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ scale: 1.03, transition: { duration: 0.3 } }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
            >
              <div className="text-5xl mb-4 text-center">{item.icon}</div>
              <h3 className="text-xl font-bold text-earthy-brown mb-4 text-center">
                {item.category}
              </h3>
              <ul className="space-y-3">
                {item.tips.map((tip, tipIndex) => (
                  <li key={tipIndex} className="flex items-start gap-2">
                    <span className="text-rose-400 mt-1 flex-shrink-0">•</span>
                    <span className="text-gray-600 text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Important Don'ts */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-orange-50 rounded-3xl p-10 border-2 border-orange-200"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-white rounded-xl shadow-sm text-orange-500">
              <AlertCircle size={32} />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-earthy-brown mb-2">
                Important Don'ts!
              </h3>
              <p className="text-gray-600">
                Avoid these common mistakes to keep your items in perfect
                condition:
              </p>
            </div>
          </div>

          <ul className="space-y-4 ml-20">
            {donts.map((dont, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center gap-3 text-gray-700 font-medium"
              >
                <span className="text-2xl">❌</span>
                <span>{dont}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* Pro Tips Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-leaf-green/20 rounded-3xl p-10 border border-leaf-green/30"
        >
          <h3 className="text-3xl font-bold text-earthy-brown mb-6 text-center">
            ✨ Pro Tips from the Maker
          </h3>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">💡</span>
              <span>
                <strong>Yarn Type Matters:</strong> Check the care tag on your
                item! Acrylic yarn is more durable and machine-washable, while
                natural fibers like cotton and wool need extra gentle care.
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">💡</span>
              <span>
                <strong>Pilling Prevention:</strong> Use a sweater comb or
                fabric shaver gently to remove any pills that form over time.
                It's normal and easy to fix!
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">💡</span>
              <span>
                <strong>Color Care:</strong> Wash dark and light colors
                separately for the first few washes to prevent color bleeding.
              </span>
            </p>
          </div>
        </motion.div>
      </section>

      {/* Contact CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-warm-peach/30 to-soft-rose/30 rounded-3xl p-12 text-center"
        >
          <Heart className="mx-auto text-rose-400 mb-4" size={40} />
          <h3 className="text-3xl font-bold text-earthy-brown mb-4">
            Need Help with Care?
          </h3>
          <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
            Not sure about your specific item? Have a stain emergency? Drop us a
            message and we'll help you out!
          </p>
          <motion.a
            href="/contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-8 py-4 bg-earthy-brown text-white rounded-2xl font-bold text-lg hover:bg-rose-400 transition-colors shadow-lg hover:shadow-xl"
          >
            Contact Us
          </motion.a>
        </motion.div>
      </section>
    </div>
  );
}

export default CareInstructions;
