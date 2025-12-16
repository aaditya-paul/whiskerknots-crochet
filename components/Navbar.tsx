"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, Heart, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Our Story", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-cozy-cream/80 dark:bg-dark-surface/90 backdrop-blur-md border-b border-warm-peach/30 dark:border-dark-rose/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-soft-rose dark:bg-dark-rose text-white p-2 rounded-full transform group-hover:rotate-12 transition-transform duration-300">
              <Heart size={20} fill="currentColor" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold text-earthy-brown dark:text-dark-peach tracking-tight">
                Whiskerknots
              </span>
              <span className="text-xs text-rose-400 dark:text-dark-rose font-medium tracking-widest uppercase">
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
                    ? "text-rose-500 dark:text-dark-rose border-b-2 border-rose-500 dark:border-dark-rose"
                    : "text-gray-600 dark:text-dark-muted hover:text-rose-400 dark:hover:text-dark-rose"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun size={20} className="text-sunny-yellow" />
              ) : (
                <Moon size={20} className="text-earthy-brown" />
              )}
            </button>
            <button className="bg-earthy-brown dark:bg-dark-rose text-white px-5 py-2 rounded-full hover:bg-rose-400 dark:hover:bg-rose-500 transition-colors duration-300 flex items-center gap-2">
              <ShoppingBag size={18} />
              <span>Cart (0)</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun size={20} className="text-sunny-yellow" />
              ) : (
                <Moon size={20} className="text-earthy-brown" />
              )}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-earthy-brown dark:text-dark-peach hover:text-rose-500 dark:hover:text-dark-rose p-2"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-dark-surface border-t border-gray-100 dark:border-gray-800 absolute w-full left-0 top-20 shadow-lg p-4">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-lg font-medium text-left px-4 py-2 rounded-lg ${
                  pathname === link.href
                    ? "bg-orange-50 dark:bg-dark-bg text-rose-500 dark:text-dark-rose"
                    : "text-gray-600 dark:text-dark-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button className="bg-earthy-brown dark:bg-dark-rose text-white w-full py-3 rounded-xl flex justify-center items-center gap-2 mt-4">
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
