"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Package,
  ArrowRight,
  CalendarDays,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { dbOrders, getReadableDbError } from "../../lib/db";
import { Order } from "../../types/types";
import {
  isUnoptimizedImageUrl,
  normalizeProductImageUrl,
} from "../../utils/productImages";

function OrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/orders");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    const loadOrders = async () => {
      setOrdersLoading(true);
      setOrdersError(null);

      try {
        const fetched = await dbOrders.fetchByUserId(user.uid);
        setOrders(fetched);
      } catch (error) {
        setOrdersError(getReadableDbError(error));
      } finally {
        setOrdersLoading(false);
      }
    };

    void loadOrders();
  }, [user]);

  if (loading || (user && ordersLoading)) {
    return (
      <div className="min-h-screen bg-cozy-cream flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cozy-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-earthy-brown">Your Orders</h1>
          <p className="text-gray-600 mt-2">
            Track your completed purchases and revisit what you ordered.
          </p>
        </motion.div>

        {ordersError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Unable to load orders: {ordersError}
          </div>
        )}

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-warm-peach/25 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="text-earthy-brown" size={28} />
            </div>
            <h2 className="text-2xl font-bold text-earthy-brown mb-2">
              No orders yet
            </h2>
            <p className="text-gray-600 mb-6">
              Once you place an order, it will show up here.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-earthy-brown text-white font-bold hover:bg-rose-400 transition-colors"
            >
              Explore Shop <ArrowRight size={16} />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const quantityCount = (order.items ?? []).reduce(
                (sum, item) => sum + item.quantity,
                0,
              );

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedOrderId((current) =>
                        current === order.id ? null : order.id,
                      )
                    }
                    className="w-full p-6 text-left"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                          Order Number
                        </p>
                        <p className="text-lg font-bold text-earthy-brown">
                          {order.orderNumber}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                          <CalendarDays size={14} />
                          <span>
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right flex flex-col sm:items-end gap-1">
                        <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                          Total
                        </p>
                        <p className="text-xl font-bold text-earthy-brown">
                          ₹{order.totalAmount.toFixed(2)}
                        </p>
                        <p className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-leaf-green/20 text-leaf-green">
                          <Package size={12} /> {order.status}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          {quantityCount} item{quantityCount !== 1 ? "s" : ""}
                        </p>
                      </div>

                      <ChevronDown
                        size={18}
                        className={`text-gray-500 transition-transform ${
                          expandedOrderId === order.id ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {expandedOrderId === order.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="px-6 pb-6 border-t border-gray-100 space-y-4"
                      >
                        <div className="pt-4 text-sm text-gray-700 font-medium">
                          {quantityCount} item{quantityCount !== 1 ? "s" : ""} in this order
                        </div>

                        {(order.items ?? []).map((item) => {
                          const imageUrl = normalizeProductImageUrl(
                            item.productImageUrl,
                          );

                          return (
                            <div
                              key={item.id}
                              className="flex gap-4 rounded-2xl border border-gray-100 p-4"
                            >
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                                {imageUrl ? (
                                  <Image
                                    src={imageUrl}
                                    alt={item.productName}
                                    width={64}
                                    height={64}
                                    unoptimized={isUnoptimizedImageUrl(imageUrl)}
                                    className="w-full h-full object-cover"
                                  />
                                ) : null}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-earthy-brown truncate">
                                  {item.productName}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Variant: {item.productVariantLabel || "Standard"}
                                </p>
                                <div className="mt-2 text-sm text-gray-700 flex flex-wrap gap-x-4 gap-y-1">
                                  <span>Qty: {item.quantity}</span>
                                  <span>
                                    Unit: ₹{item.priceAtPurchase.toFixed(2)}
                                  </span>
                                  <span className="font-semibold">
                                    Line total: ₹{item.lineTotal.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        <div className="rounded-2xl bg-cozy-cream p-4 text-sm text-gray-700 space-y-1">
                          <p className="font-semibold text-earthy-brown">
                            Shipping Details
                          </p>
                          <p>
                            {order.shippingDetails
                              ? `${order.shippingDetails.firstName} ${order.shippingDetails.lastName}`
                              : "Not available"}
                          </p>
                          <p>{order.shippingDetails?.address || "-"}</p>
                          <p>
                            {order.shippingDetails
                              ? `${order.shippingDetails.city}, ${order.shippingDetails.state} ${order.shippingDetails.zipCode}`
                              : "-"}
                          </p>
                          <p>{order.shippingDetails?.country || "-"}</p>
                          <p>Phone: {order.shippingDetails?.phone || "-"}</p>
                          <p>Email: {order.shippingDetails?.email || "-"}</p>
                        </div>

                        <div className="rounded-2xl border border-gray-100 p-4 text-sm text-gray-700 space-y-1">
                          <p className="font-semibold text-earthy-brown">
                            Pricing Breakdown
                          </p>
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{order.subtotalAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>₹{order.shippingAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax</span>
                            <span>₹{order.taxAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-earthy-brown pt-1 border-t border-gray-200 mt-1">
                            <span>Total</span>
                            <span>₹{order.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
