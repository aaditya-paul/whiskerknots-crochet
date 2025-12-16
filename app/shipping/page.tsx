"use client";
import React from "react";
import { Package, Truck, Clock, MapPin, Heart, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";

function ShippingPolicy() {
  const shippingOptions = [
    {
      icon: <Truck size={28} />,
      title: "Standard Shipping",
      time: "5-7 Business Days",
      price: "$5.99",
      description: "Perfect for most orders. Reliable and affordable.",
    },
    {
      icon: <Package size={28} />,
      title: "Express Shipping",
      time: "2-3 Business Days",
      price: "$12.99",
      description: "Need it faster? We've got you covered!",
    },
    {
      icon: <Heart size={28} />,
      title: "Free Shipping",
      time: "5-7 Business Days",
      price: "Free on orders over $75",
      description: "Treat yourself to more handmade goodness!",
    },
  ];

  const faqs = [
    {
      question: "When will my order ship?",
      answer:
        "Most items ship within 1-3 business days. Custom orders may take 7-14 days depending on complexity. We'll always keep you updated!",
    },
    {
      question: "Do you ship internationally?",
      answer:
        "Currently, we ship within the United States only. We're working on expanding internationally - stay tuned!",
    },
    {
      question: "How can I track my order?",
      answer:
        "Once your order ships, you'll receive a tracking number via email. You can use it to monitor your package's journey to you!",
    },
    {
      question: "What if my item arrives damaged?",
      answer:
        "Oh no! We pack everything with lots of care, but if something arrives damaged, please contact us within 48 hours with photos. We'll make it right!",
    },
  ];

  return (
    <div className="min-h-screen bg-cozy-cream">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-warm-peach/20 rounded-[3rem] mt-4 mx-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.6, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-50 pointer-events-none"
        ></motion.div>

        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block p-3 bg-white rounded-full shadow-sm mb-6"
          >
            <Package className="text-rose-400" size={40} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold text-earthy-brown mb-6"
          >
            Shipping Policy
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            We package each item with care and lots of love, ensuring your
            handmade treasure arrives safe and sound! 📦
          </motion.p>
        </div>
      </section>

      {/* Shipping Options */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {shippingOptions.map((option, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100"
            >
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6 text-rose-400">
                {option.icon}
              </div>
              <h3 className="text-2xl font-bold text-earthy-brown mb-2">
                {option.title}
              </h3>
              <div className="flex items-center gap-2 text-gray-500 mb-3">
                <Clock size={16} />
                <span className="text-sm">{option.time}</span>
              </div>
              <p className="text-2xl font-bold text-rose-400 mb-4">
                {option.price}
              </p>
              <p className="text-gray-600">{option.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Processing Time */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-orange-50 rounded-3xl p-10 border border-orange-100"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm text-rose-400 mt-1">
              <Clock size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-earthy-brown mb-3">
                Processing Time
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Because each item is handmade with love, we need a little time
                to prepare your order. Here's what to expect:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle
                    className="text-leaf-green mt-1 flex-shrink-0"
                    size={20}
                  />
                  <span className="text-gray-600">
                    <strong>In-Stock Items:</strong> Ships within 1-3 business
                    days
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle
                    className="text-leaf-green mt-1 flex-shrink-0"
                    size={20}
                  />
                  <span className="text-gray-600">
                    <strong>Made-to-Order:</strong> Takes 5-10 business days to
                    create, then ships
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle
                    className="text-leaf-green mt-1 flex-shrink-0"
                    size={20}
                  />
                  <span className="text-gray-600">
                    <strong>Custom Orders:</strong> Processing time varies (7-14
                    days typically)
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-earthy-brown text-center mb-12"
        >
          Frequently Asked Questions
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="space-y-6"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
            >
              <h4 className="text-xl font-bold text-earthy-brown mb-3">
                {faq.question}
              </h4>
              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Contact CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-warm-peach/30 to-soft-rose/30 rounded-3xl p-12 text-center"
        >
          <MapPin className="mx-auto text-rose-400 mb-4" size={40} />
          <h3 className="text-3xl font-bold text-earthy-brown mb-4">
            Still Have Questions?
          </h3>
          <p className="text-gray-600 text-lg mb-6">
            We're here to help! Reach out and we'll get back to you as soon as
            we finish this row of stitches.
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

export default ShippingPolicy;
