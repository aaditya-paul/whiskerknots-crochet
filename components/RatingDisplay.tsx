"use client";

import React from "react";
import { Star } from "lucide-react";
import { ProductReview } from "@/types/types";

interface RatingDisplayProps {
  reviews: ProductReview[];
  compact?: boolean;
  summary?: {
    average: number | null;
    total: number;
    distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  };
}

export default function RatingDisplay({
  reviews,
  compact = false,
  summary,
}: RatingDisplayProps) {
  const totalReviews = summary?.total ?? reviews.length;

  if (totalReviews === 0) {
    return (
      <div className="text-gray-500 text-sm">
        {compact ? "No ratings yet" : "No reviews yet"}
      </div>
    );
  }

  const averageRating =
    summary?.average ??
    reviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(reviews.length, 1);
  const ratingDistribution = summary?.distribution ?? {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  return (
    <div
      className={
        compact ? "" : "bg-white rounded-lg p-6 border border-gray-200"
      }
    >
      <div className="flex items-start gap-6">
        {/* Average rating section */}
        <div className="flex flex-col items-center">
          <div className="text-4xl font-bold text-earthy-brown">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={`${
                  i < Math.round(averageRating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {totalReviews} review{totalReviews !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Rating distribution */}
        {!compact && (
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-600 w-8">{rating}★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded">
                  <div
                    className="h-full bg-yellow-400 rounded"
                    style={{
                      width: `${
                        reviews.length > 0
                          ? (ratingDistribution[
                              rating as keyof typeof ratingDistribution
                            ] /
                              totalReviews) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-xs text-gray-600 w-8">
                  {
                    ratingDistribution[
                      rating as keyof typeof ratingDistribution
                    ]
                  }
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
