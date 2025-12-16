"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { SHIPPING_COST_THRESHOLD } from "@/constants/constants";

const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getCartCount,
  } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  const subtotal = getCartTotal();
  const shipping = subtotal > 75 ? 0 : 5.99;
  const total = subtotal + shipping;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-cozy-cream shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-rose-100 p-2 rounded-full">
                  <ShoppingBag className="text-rose-400" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-earthy-brown">
                    Your Cart
                  </h2>
                  <p className="text-sm text-gray-500">
                    {getCartCount()} {getCartCount() === 1 ? "item" : "items"}
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </motion.button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={40} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-earthy-brown mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Add some cozy items to get started!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      closeCart();
                      router.push("/shop");
                    }}
                    className="px-6 py-3 bg-earthy-brown text-white rounded-2xl font-bold hover:bg-rose-400 transition-colors"
                  >
                    Browse Products
                  </motion.button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4"
                  >
                    {/* Image */}
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 text-sm mb-1 truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                        {item.category}
                      </p>
                      <p className="text-lg font-bold text-rose-400">
                        ₹{item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity & Remove */}
                    <div className="flex flex-col items-end justify-between">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </motion.button>

                      <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={14} className="text-gray-600" />
                        </motion.button>
                        <span className="px-3 font-bold text-sm text-earthy-brown min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1 hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={14} className="text-gray-600" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="bg-white border-t border-gray-200 p-6 space-y-4">
                {/* Subtotal & Shipping */}
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="font-bold">
                      {shipping === 0 ? (
                        <span className="text-leaf-green">Free! 🎉</span>
                      ) : (
                        `₹${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {subtotal < SHIPPING_COST_THRESHOLD && (
                    <p className="text-xs text-gray-500 bg-yellow-50 p-2 rounded-lg">
                      Add ₹{(SHIPPING_COST_THRESHOLD - subtotal).toFixed(2)}{" "}
                      more for free shipping!
                    </p>
                  )}
                  <div className="flex justify-between text-xl font-bold text-earthy-brown pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full bg-earthy-brown text-white font-bold py-4 rounded-2xl hover:bg-rose-400 transition-colors shadow-lg hover:shadow-xl"
                >
                  Proceed to Checkout
                </motion.button>

                <button
                  onClick={closeCart}
                  className="w-full text-gray-600 font-bold py-2 hover:text-rose-400 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
