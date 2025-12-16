"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { openCart, getCartCount } = useCart();
  const [cartCount, setCartCount] = useState(0);

  // Update cart count after mount to avoid hydration mismatch
  React.useEffect(() => {
    setCartCount(getCartCount());
  }, [getCartCount]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Our Story", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-cozy-cream/80 backdrop-blur-md  border-warm-peach/30 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 12 }}
              transition={{ duration: 0.3 }}
              className="bg-rose-400 text-white p-2 rounded-full"
            >
              <Heart size={20} fill="currentColor" />
            </motion.div>
            <div className="flex flex-col items-start">
              <span className="text-2xl font-sans font-bold text-earthy-brown tracking-tight">
                Whiskerknots
              </span>
              <span className="text-xs font-sans text-rose-400 font-medium tracking-widest uppercase">
                Loops of Love
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className={`text-sm font-bold uppercase tracking-wide transition-colors duration-200 ${
                    pathname === link.href
                      ? "text-rose-500 border-b-2 border-rose-500"
                      : "text-gray-600 hover:text-rose-400"
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.button
              onClick={openCart}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: navLinks.length * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-earthy-brown text-white px-5 py-2 rounded-full hover:bg-rose-400 transition-colors duration-300 flex items-center gap-2 relative"
            >
              <ShoppingBag size={18} />
              <span>Cart</span>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
                >
                  {cartCount}
                </motion.span>
              )}
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-earthy-brown hover:text-rose-500 p-2"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 top-20 shadow-lg p-4">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-lg font-medium text-left px-4 py-2 rounded-lg ${
                  pathname === link.href
                    ? "bg-orange-50 text-rose-500"
                    : "text-gray-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button className="bg-earthy-brown text-white w-full py-3 rounded-xl flex justify-center items-center gap-2 mt-4">
              <ShoppingBag size={20} />
              <span>View Cart</span>
            </button>
          </div>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
