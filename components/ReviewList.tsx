"use client";

import React from "react";
import { Star, ThumbsUp, User } from "lucide-react";
import { ProductReview } from "@/types/types";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface ReviewListProps {
  reviews: ProductReview[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  return (
    <div className="space-y-4">
      {reviews.map((review, index) => {
        const reviewerPhoto = review.reviewerPhotoUrl;

        return (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border-l-4 border-rose-400 bg-white p-6 rounded-lg shadow-sm"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {reviewerPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                  <img
                    src={reviewerPhoto}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-rose-200 flex items-center justify-center">
                    <User size={16} className="text-rose-400" />
                  </div>
                )}
                <div>
                  <div className="font-semibold text-gray-900">
                    {review.reviewerName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(review.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
              {review.verifiedPurchase && (
                <span className="text-xs font-semibold px-3 py-1 bg-green-100 text-green-700 rounded-full">
                  Verified Purchase
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={`${
                      i < review.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {review.rating}.0
              </span>
            </div>

            {/* Title and content */}
            {review.title && (
              <h4 className="font-semibold text-gray-900 mb-2">
                {review.title}
              </h4>
            )}
            {review.content && (
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {review.content}
              </p>
            )}

            {/* Helpful button */}
            {review.helpfulCount > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <ThumbsUp size={12} />
                <span>{review.helpfulCount} found this helpful</span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
