"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Menu,
  X,
  Heart,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const { openCart, getCartCount } = useCart();
  const { user, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Sync counts
  useEffect(() => {
    setCartCount(getCartCount());
    const updateFavs = () => {
      const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
      setFavoriteCount(favs.length);
    };
    updateFavs();
    window.addEventListener("favoritesChanged", updateFavs);
    return () => window.removeEventListener("favoritesChanged", updateFavs);
  }, [getCartCount]);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

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
      className="sticky top-0 z-50 bg-[#fffdf7]/80 backdrop-blur-lg border-b border-[#ffdab9]/20 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* LOGO AREA */}
          <Link href="/" className="inline-flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 12 }}
              transition={{ duration: 0.3 }}
              className="bg-rose-400 text-white p-3 rounded-full"
            >
              <Heart className=" w-4 h-4 md:w-6 md:h-6 " fill="currentColor" />
            </motion.div>
            <div className="flex flex-col items-start">
              <span className=" text-xl md:text-3xl  font-sans font-bold text-earthy-brown tracking-tight">
                Whiskerknots
              </span>
              <span className="text-xs font-sans text-rose-400 font-medium tracking-widest uppercase">
                Loops of Love
              </span>
            </div>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center bg-white/40 px-6 py-2 rounded-full border border-[#8d6e63]/5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 text-xs font-bold uppercase tracking-widest transition-all relative group ${
                  pathname === link.href
                    ? "text-rose-500"
                    : "text-[#8d6e63] hover:text-rose-300"
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.div
                    layoutId="navUnderline"
                    className="absolute -bottom-1 left-4 right-4 h-0.5 bg-rose-400 rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* ACTION BUTTONS */}
          <div className="hidden md:flex items-center gap-3">
            {/* Favorites */}
            <motion.button
              onClick={() => window.dispatchEvent(new Event("openFavorites"))}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 text-[#f4c2c2] hover:bg-[#f4c2c2]/10 rounded-full relative transition-colors"
            >
              <Heart size={20} />
              <AnimatePresence>
                {favoriteCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-1 right-1 bg-[#f4c2c2] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#fffdf7]"
                  >
                    {favoriteCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Cart Button */}
            <motion.button
              onClick={openCart}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#8d6e63] text-white px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-md hover:bg-[#a1887f] transition-all"
            >
              <div className="relative">
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#f4c2c2] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-sm font-bold uppercase tracking-wider">
                Cart
              </span>
            </motion.button>

            {/* Auth Menu */}
            <div className="relative ml-2">
              {user ? (
                <>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1 pr-3 bg-white border border-[#ffdab9] rounded-full hover:shadow-md transition-all"
                  >
                    <div className="w-8 h-8 bg-[#f4c2c2] rounded-full flex items-center justify-center text-white">
                      <User size={16} />
                    </div>
                    <ChevronDown
                      size={14}
                      className={`text-[#8d6e63] transition-transform ${
                        showUserMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-[#ffdab9]/30 overflow-hidden"
                      >
                        <div className="p-4 bg-[#fffdf7] border-b border-[#ffdab9]/20">
                          <p className="font-bold text-[#8d6e63] text-sm truncate">
                            {user.displayName || "Maker"}
                          </p>
                          <p className="text-[10px] text-[#8d6e63]/50 truncate tracking-tighter">
                            {user.email}
                          </p>
                        </div>
                        <div className="p-2">
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-[#f4c2c2]/10 rounded-2xl transition-colors text-[#8d6e63] font-bold text-sm"
                          >
                            <User size={18} className="text-[#f4c2c2]" />{" "}
                            Profile
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-2xl transition-colors text-red-400 font-bold text-sm text-left"
                          >
                            <LogOut size={18} /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link href="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="text-[#8d6e63] text-sm cursor-pointer font-bold uppercase tracking-widest px-4"
                  >
                    Sign In
                  </motion.button>
                </Link>
              )}
            </div>
          </div>

          {/* MOBILE TOGGLE */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#8d6e63] p-2"
            >
              {isMobileMenuOpen ? <X size={30} /> : <Menu size={30} />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#fffdf7] border-t border-[#ffdab9]/20 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block text-2xl font-serif font-bold ${
                    pathname === link.href ? "text-[#f4c2c2]" : "text-[#8d6e63]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-6 grid grid-cols-2 gap-4">
                <button
                  onClick={openCart}
                  className="bg-[#8d6e63] text-white p-4 rounded-3xl flex flex-col items-center gap-2"
                >
                  <ShoppingBag />
                  <span className="text-xs font-bold uppercase">
                    Cart ({cartCount})
                  </span>
                </button>
                <Link
                  href={user ? "/profile" : "/login"}
                  className="bg-[#f4c2c2] text-white p-4 rounded-3xl flex flex-col items-center gap-2 text-center"
                >
                  <User />
                  <span className="text-xs font-bold uppercase">
                    {user ? "Profile" : "Sign In"}
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
