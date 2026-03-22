"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "../../../components/ProductCard";
import ProductDetailView from "../../../components/ProductDetailView";
import AddReviewForm from "@/components/AddReviewForm";
import RatingDisplay from "@/components/RatingDisplay";
import ReviewList from "@/components/ReviewList";
import { fadeInUp, staggerContainer } from "../../../utils/animations";
import { useProducts } from "../../../hooks/useProducts";
import { dbReviews, getReadableDbError } from "@/lib/db";
import { ProductReview } from "@/types/types";

const REVIEWS_PAGE_SIZE = 6;
const RATING_FILTER_OPTIONS: Array<"all" | 5 | 4 | 3 | 2 | 1> = [
  "all",
  5,
  4,
  3,
  2,
  1,
];

function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { products, loading, error } = useProducts();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [ratingFilter, setRatingFilter] = useState<"all" | 5 | 4 | 3 | 2 | 1>(
    "all",
  );
  const [ratingSummary, setRatingSummary] = useState<{
    average: number | null;
    total: number;
    distribution: Record<1 | 2 | 3 | 4 | 5, number>;
  } | null>(null);

  const product = products.find((p) => p.slug === slug);

  const loadReviews = useCallback(
    async (options: {
      productId: string;
      page: number;
      append: boolean;
      rating: "all" | 5 | 4 | 3 | 2 | 1;
    }) => {
      const { productId, page, append, rating } = options;

      if (append) {
        setLoadingMore(true);
      } else {
        setReviewsLoading(true);
      }
      setReviewsError(null);

      try {
        const [{ reviews: fetched, total }, summary] = await Promise.all([
          dbReviews.fetchByProductId(productId, {
            page,
            pageSize: REVIEWS_PAGE_SIZE,
            rating: rating === "all" ? undefined : rating,
          }),
          dbReviews.fetchSummaryByProductId(productId),
        ]);

        setReviews((current) => (append ? [...current, ...fetched] : fetched));
        setReviewsTotal(total);
        setRatingSummary(summary);
        setReviewsPage(page);
      } catch (err) {
        setReviewsError(getReadableDbError(err));
      } finally {
        setReviewsLoading(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!product?.id) return;
    void loadReviews({
      productId: product.id,
      page: 1,
      append: false,
      rating: ratingFilter,
    });
  }, [product?.id, ratingFilter, loadReviews]);

  const averageRating = useMemo(() => {
    return ratingSummary?.average ?? null;
  }, [ratingSummary]);

  const canLoadMore = reviews.length < reviewsTotal;

  if (loading && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="max-w-lg rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
            <h1 className="text-2xl font-bold text-red-800 mb-3">
              Couldn&apos;t load this product
            </h1>
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <button
              onClick={() => router.push("/shop")}
              className="px-6 py-3 bg-earthy-brown text-white rounded-2xl font-bold hover:bg-rose-400 transition-colors"
            >
              Back to Shop
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-earthy-brown mb-4">
            Product Not Found
          </h1>
          <button
            onClick={() => router.push("/shop")}
            className="px-6 py-3 bg-earthy-brown text-white rounded-2xl font-bold hover:bg-rose-400 transition-colors"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  // Related products (same category, excluding current)
  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-cozy-cream">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => router.push("/shop")}
          className="flex items-center gap-2 text-gray-600 hover:text-rose-400 transition-colors group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="font-bold">Back to Shop</span>
        </motion.button>
      </div>

      <ProductDetailView
        product={product}
        onNavigateCare={() => router.push("/care")}
        ratingSummary={{
          average: averageRating,
          count: reviews.length,
        }}
      />

      {/* Customer Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-earthy-brown text-center mb-12"
        >
          Ratings & Reviews
        </motion.h2>

        {reviewsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-rose-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {reviewsError && (
              <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-4 text-sm">
                Unable to load reviews right now: {reviewsError}
              </div>
            )}

            <RatingDisplay reviews={reviews} summary={ratingSummary ?? undefined} />

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Filter:</span>
              {RATING_FILTER_OPTIONS.map((option) => {
                const isActive = ratingFilter === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRatingFilter(option)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      isActive
                        ? "bg-earthy-brown text-white border-earthy-brown"
                        : "bg-white text-gray-700 border-gray-300 hover:border-earthy-brown"
                    }`}
                  >
                    {option === "all" ? "All" : `${option}★`}
                  </button>
                );
              })}
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="space-y-4"
            >
              {reviews.length > 0 ? (
                <ReviewList reviews={reviews} />
              ) : (
                <motion.div
                  variants={fadeInUp}
                  className="bg-white rounded-2xl border border-gray-200 p-8 text-center"
                >
                  <MessageSquare
                    className="mx-auto text-gray-400 mb-3"
                    size={30}
                  />
                  <h3 className="text-lg font-semibold text-earthy-brown mb-1">
                    No reviews yet
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Be the first to review this product after purchase.
                  </p>
                </motion.div>
              )}
            </motion.div>

            {canLoadMore && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (!product?.id || loadingMore) return;
                    void loadReviews({
                      productId: product.id,
                      page: reviewsPage + 1,
                      append: true,
                      rating: ratingFilter,
                    });
                  }}
                  disabled={loadingMore}
                  className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                    loadingMore
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-earthy-brown text-white hover:bg-rose-400"
                  }`}
                >
                  {loadingMore ? "Loading..." : "Load more reviews"}
                </button>
              </div>
            )}

            <AddReviewForm
              productId={product.id}
              onReviewAdded={() => {
                void loadReviews({
                  productId: product.id,
                  page: 1,
                  append: false,
                  rating: ratingFilter,
                });
              }}
            />
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-earthy-brown text-center mb-12"
          >
            You Might Also Love
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {relatedProducts.map((relatedProduct) => (
              <motion.div
                key={relatedProduct.id}
                variants={fadeInUp}
                onClick={() => router.push(`/shop/${relatedProduct.slug}`)}
              >
                <ProductCard product={relatedProduct} />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}
    </div>
  );
}

export default ProductPage;
