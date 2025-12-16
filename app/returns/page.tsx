"use client";
import React from "react";
import {
  RotateCcw,
  Package,
  CheckCircle,
  XCircle,
  Mail,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../utils/animations";

function ReturnsPolicy() {
  const returnProcess = [
    {
      step: "1",
      title: "Contact Us",
      description:
        "Email us within 14 days of receiving your order with your order number and reason for return.",
      icon: <Mail size={28} />,
    },
    {
      step: "2",
      title: "Get Approval",
      description:
        "We'll review your request and send you a return authorization and shipping instructions.",
      icon: <CheckCircle size={28} />,
    },
    {
      step: "3",
      title: "Ship It Back",
      description:
        "Pack your item carefully in its original packaging and ship it back to us with tracking.",
      icon: <Package size={28} />,
    },
    {
      step: "4",
      title: "Receive Refund",
      description:
        "Once we receive and inspect your return, we'll process your refund within 5-7 business days.",
      icon: <RotateCcw size={28} />,
    },
  ];

  const eligibleReturns = [
    "Item arrived damaged or defective",
    "Wrong item was shipped",
    "Item doesn't match description",
    "You changed your mind (within 14 days, item unused with tags)",
  ];

  const nonEligibleReturns = [
    "Custom or personalized orders",
    "Items marked as final sale",
    "Items worn, washed, or altered",
    "Returns after 14 days of delivery",
    "Items without original tags/packaging",
  ];

  return (
    <div className="min-h-screen bg-cozy-cream">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-warm-peach/20 rounded-[3rem] mt-4 mx-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.6, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-rose-200 rounded-full blur-3xl opacity-50 pointer-events-none"
        ></motion.div>

        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-block p-3 bg-white rounded-full shadow-sm mb-6"
          >
            <RotateCcw className="text-rose-400" size={40} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold text-earthy-brown mb-6"
          >
            Returns & Exchanges
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Your happiness is our priority! If something's not quite right,
            we're here to help make it perfect. 💝
          </motion.p>
        </div>
      </section>

      {/* Return Process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-earthy-brown text-center mb-12"
        >
          How to Return an Item
        </motion.h2>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {returnProcess.map((step, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100"
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-rose-400 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                {step.step}
              </div>
              <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mb-6 text-rose-400 mt-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-earthy-brown mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Eligibility Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-earthy-brown text-center mb-12"
        >
          What Can Be Returned?
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Eligible Returns */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-leaf-green/20 rounded-3xl p-10 border-2 border-leaf-green/40"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white rounded-full shadow-sm">
                <CheckCircle className="text-green-500" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-earthy-brown">
                Eligible for Returns
              </h3>
            </div>
            <ul className="space-y-4">
              {eligibleReturns.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle
                    className="text-green-500 mt-1 flex-shrink-0"
                    size={20}
                  />
                  <span className="text-gray-700">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Non-Eligible Returns */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-orange-50 rounded-3xl p-10 border-2 border-orange-200"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white rounded-full shadow-sm">
                <XCircle className="text-orange-500" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-earthy-brown">
                Not Eligible for Returns
              </h3>
            </div>
            <ul className="space-y-4">
              {nonEligibleReturns.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <XCircle
                    className="text-orange-500 mt-1 flex-shrink-0"
                    size={20}
                  />
                  <span className="text-gray-700">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Exchanges */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100"
        >
          <h3 className="text-3xl font-bold text-earthy-brown mb-6 text-center">
            Want to Exchange Instead?
          </h3>
          <p className="text-gray-600 text-lg text-center mb-6 leading-relaxed">
            We're happy to exchange items for a different size or color (subject
            to availability). Just mention "exchange" in your return request and
            tell us what you'd prefer!
          </p>
          <div className="bg-warm-peach/20 rounded-2xl p-6 text-center">
            <p className="text-gray-700">
              <strong>Note:</strong> Exchanges are subject to item availability.
              If your preferred item is out of stock, we'll process a full
              refund instead.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Important Info */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-dusty-rose/20 rounded-3xl p-10 border border-dusty-rose/40"
        >
          <h3 className="text-2xl font-bold text-earthy-brown mb-6">
            Important Return Information
          </h3>
          <div className="space-y-4 text-gray-700">
            <p className="flex items-start gap-3">
              <span className="text-rose-400 text-xl flex-shrink-0 mt-1">
                •
              </span>
              <span>
                <strong>Shipping Costs:</strong> Original shipping fees are
                non-refundable. Return shipping costs are the customer's
                responsibility unless the item is defective or we made an error.
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-rose-400 text-xl flex-shrink-0 mt-1">
                •
              </span>
              <span>
                <strong>Refund Method:</strong> Refunds will be issued to the
                original payment method used for the purchase.
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-rose-400 text-xl flex-shrink-0 mt-1">
                •
              </span>
              <span>
                <strong>Restocking Fee:</strong> No restocking fees! We just ask
                that items be returned in their original condition.
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-rose-400 text-xl flex-shrink-0 mt-1">
                •
              </span>
              <span>
                <strong>Custom Orders:</strong> Due to their personalized
                nature, custom orders are final sale unless there's a defect or
                error on our part.
              </span>
            </p>
          </div>
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
          <Heart className="mx-auto text-rose-400 mb-4" size={40} />
          <h3 className="text-3xl font-bold text-earthy-brown mb-4">
            Questions About Returns?
          </h3>
          <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
            We're here to help! Every item is made with love, and we want you to
            absolutely adore your purchase. Reach out anytime!
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

export default ReturnsPolicy;
