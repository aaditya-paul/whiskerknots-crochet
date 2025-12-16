"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, Heart } from "lucide-react";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Our Story", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-cozy-cream/80 backdrop-blur-md  border-warm-peach/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-rose-400 text-white p-2 rounded-full transform group-hover:rotate-12 transition-transform duration-300">
              <Heart size={20} fill="currentColor" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold text-earthy-brown tracking-tight">
                Whiskerknots
              </span>
              <span className="text-xs text-rose-400 font-medium tracking-widest uppercase">
                Loops of Love
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-bold uppercase tracking-wide transition-colors duration-200 ${
                  pathname === link.href
                    ? "text-rose-500 border-b-2 border-rose-500"
                    : "text-gray-600 hover:text-rose-400"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button className="bg-earthy-brown text-white px-5 py-2 rounded-full hover:bg-rose-400 transition-colors duration-300 flex items-center gap-2">
              <ShoppingBag size={18} />
              <span>Cart (0)</span>
            </button>
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
    </nav>
  );
};

export default Navbar;
