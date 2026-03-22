"use client";

import React, { useState } from "react";
import { Star, Send, AlertCircle, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { dbReviews, dbOrders } from "@/lib/db";
import { getReadableDbError } from "@/lib/db";

interface AddReviewFormProps {
  productId: string;
  onReviewAdded?: () => void;
}

export default function AddReviewForm({
  productId,
  onReviewAdded,
}: AddReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState(false);

  const canSubmit = user && rating > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);
    setPurchaseError(false);

    try {
      // Check if user purchased the product
      const hasPurchased = await dbOrders.userPurchasedProduct(
        user!.uid,
        productId,
      );

      if (!hasPurchased) {
        setPurchaseError(true);
        setError("You must purchase this product before writing a review.");
        setLoading(false);
        return;
      }

      // Create review
      await dbReviews.create({
        productId,
        userId: user!.uid,
        rating,
        title: title.trim() || undefined,
        content: content.trim() || undefined,
        verifiedPurchase: true,
        reviewerName:
          user!.displayName ?? user!.email?.split("@")[0] ?? "Customer",
        reviewerPhotoUrl: user!.photoURL ?? undefined,
      });

      setSuccess(true);
      setRating(0);
      setTitle("");
      setContent("");

      setTimeout(() => {
        setSuccess(false);
        onReviewAdded?.();
      }, 2000);
    } catch (err) {
      setError(getReadableDbError(err));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Lock className="text-blue-600 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">
              Sign in to review
            </h4>
            <p className="text-sm text-blue-800">
              You must be signed in to write a review. Please log in to
              continue.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-6 border border-earthy-brown"
    >
      <h3 className="text-lg font-bold text-earthy-brown mb-4">
        Share Your Review
      </h3>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg flex items-center gap-2 text-sm"
        >
          <div className="w-2 h-2 rounded-full bg-green-600" />
          Review posted successfully! Thank you for your feedback.
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-4 rounded-lg flex items-center gap-2 text-sm ${
            purchaseError
              ? "bg-amber-100 text-amber-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <AlertCircle size={16} />
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <motion.button
                key={r}
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRating(r)}
                onMouseEnter={() => setHoverRating(r)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none transition-transform"
              >
                <Star
                  size={32}
                  className={`${
                    r <= (hoverRating || rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  } transition-colors`}
                />
              </motion.button>
            ))}
            {rating > 0 && (
              <span className="ml-2 self-center text-sm font-semibold text-gray-600">
                {rating}/5
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Title (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Perfect gift!"
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition"
            disabled={loading}
          />
          <div className="text-xs text-gray-500 mt-1">{title.length}/100</div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Your Review (optional)
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your experience with this product..."
            maxLength={1000}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-transparent outline-none transition resize-none"
            disabled={loading}
          />
          <div className="text-xs text-gray-500 mt-1">
            {content.length}/1000
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={!canSubmit || loading || success}
          className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
            canSubmit && !loading
              ? "bg-rose-400 text-white hover:bg-rose-500 shadow-md"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Posting...
            </>
          ) : success ? (
            "✓ Posted!"
          ) : (
            <>
              <Send size={18} />
              Post Review
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
