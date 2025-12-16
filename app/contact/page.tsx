"use client";
import React, { useState } from "react";
import { Mail, MapPin, Send } from "lucide-react";
import { motion } from "framer-motion";
import { fadeInUp, scaleIn } from "../../utils/animations";

function Page() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real app, send data to backend here
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={scaleIn}
          className="bg-white p-12 rounded-[3rem] shadow-sm border border-green-100"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <Send size={40} />
          </div>
          <h2 className="text-3xl font-bold text-earthy-brown mb-4">
            Message Sent!
          </h2>
          <p className="text-gray-600 mb-8">
            Thanks for reaching out! We&apos;ll get back to you as soon as we
            finish this row of stitches.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="text-rose-500 font-bold hover:underline"
          >
            Send another message
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-bold text-earthy-brown mb-6"
          >
            Let&apos;s Chat!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-gray-600 text-lg mb-8"
          >
            Have a question about a custom order? Want to know when a product
            will be back in stock? Or just want to say hi? Drop us a line!
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15, delayChildren: 0.4 },
              },
            }}
            className="space-y-6"
          >
            <motion.div
              variants={fadeInUp}
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
              className="flex items-start gap-4"
            >
              <div className="p-3 bg-white rounded-xl shadow-sm text-rose-400">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="font-bold text-earthy-brown">Email Us</h4>
                <p className="text-gray-500">hello@whiskerknots.com</p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
              className="flex items-start gap-4"
            >
              <div className="p-3 bg-white rounded-xl shadow-sm text-rose-400">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="font-bold text-earthy-brown">Studio Location</h4>
                <p className="text-gray-500">
                  123 Yarn Ball Lane
                  <br />
                  Craftsville, CA 90210
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-12 bg-rose-50 p-6 rounded-3xl"
          >
            <p className="text-earthy-brown italic font-medium">
              &ldquo;Loops of Love means we care about every single customer.
              Don&apos;t hesitate to reach out!&rdquo;
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-orange-100"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  Email
                </label>
                <input
                  required
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Subject
              </label>
              <select className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all text-gray-600">
                <option>General Inquiry</option>
                <option>Custom Order Request</option>
                <option>Shipping Question</option>
                <option>Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Message
              </label>
              <textarea
                required
                rows={5}
                placeholder="How can we help?"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-earthy-brown text-white font-bold py-4 rounded-xl hover:bg-rose-400 transition-colors shadow-lg hover:shadow-xl transform active:scale-95 duration-200"
            >
              Send Message
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default Page;
