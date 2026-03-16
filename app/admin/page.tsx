"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Edit3, Save, PlusCircle, RefreshCw, ShieldAlert } from "lucide-react";
import { Product } from "../../types/types";
import { useAuth } from "../../context/AuthContext";
import { PRODUCTS } from "../../constants/constants";
import { useProducts } from "../../hooks/useProducts";
import {
  createProductInCms,
  ProductFormData,
  seedProductsToCms,
  updateProductInCms,
} from "../../services/productCmsService";

type ProductFormState = {
  name: string;
  price: string;
  category: Product["category"];
  image: string;
  description: string;
  isFeatured: boolean;
  slug: string;
};

const CATEGORIES: Product["category"][] = ["amigurumi", "wearables", "decor"];

const EMPTY_FORM: ProductFormState = {
  name: "",
  price: "",
  category: "amigurumi",
  image: "",
  description: "",
  isFeatured: false,
  slug: "",
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    products,
    loading: productsLoading,
    error,
    usingFallback,
  } = useProducts();

  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const adminEmails = useMemo(() => {
    return (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
  }, []);

  const isAdmin = useMemo(() => {
    const currentEmail = user?.email?.toLowerCase();
    if (!currentEmail) {
      return false;
    }

    return adminEmails.includes(currentEmail);
  }, [adminEmails, user?.email]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/admin");
    }
  }, [authLoading, user, router]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setSubmitError(null);
  };

  const toPayload = (state: ProductFormState): ProductFormData => {
    return {
      name: state.name.trim(),
      price: Number(state.price),
      category: state.category,
      image: state.image.trim(),
      description: state.description.trim(),
      isFeatured: state.isFeatured,
      slug: slugify(state.slug || state.name),
    };
  };

  const validate = (state: ProductFormState): string | null => {
    if (!state.name.trim()) return "Product name is required.";
    if (!state.price.trim() || Number.isNaN(Number(state.price))) {
      return "A valid price is required.";
    }
    if (Number(state.price) <= 0) return "Price must be greater than 0.";
    if (!state.image.trim()) return "Image URL is required.";
    if (!state.description.trim()) return "Description is required.";
    if (!slugify(state.slug || state.name)) {
      return "Slug is required and must contain letters or numbers.";
    }

    return null;
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      image: product.image,
      description: product.description,
      isFeatured: Boolean(product.isFeatured),
      slug: product.slug,
    });
    setMessage(null);
    setSubmitError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    const validationError = validate(form);
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    try {
      setSaving(true);
      setSubmitError(null);
      const payload = toPayload(form);

      if (editingId) {
        await updateProductInCms(editingId, payload);
        setMessage("Product updated in CMS.");
      } else {
        await createProductInCms(payload);
        setMessage("Product added to CMS.");
      }

      resetForm();
    } catch (saveError) {
      console.error(saveError);
      setSubmitError("Failed to save product. Check Supabase policies.");
    } finally {
      setSaving(false);
    }
  };

  const handleSeedDefaults = async () => {
    try {
      setSeeding(true);
      setMessage(null);
      setSubmitError(null);
      await seedProductsToCms(PRODUCTS);
      setMessage("Default catalog copied to CMS.");
    } catch (seedError) {
      console.error(seedError);
      setSubmitError("Failed to seed defaults. Check Supabase policies.");
    } finally {
      setSeeding(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-cozy-cream flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-rose-100 shadow-lg p-8 text-center">
          <ShieldAlert size={36} className="mx-auto text-rose-400 mb-4" />
          <h1 className="text-3xl font-bold text-earthy-brown mb-2">
            Admin Access Required
          </h1>
          <p className="text-gray-600 mb-6">
            Your account is signed in but is not in the admin allowlist. Add
            your email to NEXT_PUBLIC_ADMIN_EMAILS in your environment config.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-earthy-brown text-white rounded-2xl font-bold hover:bg-rose-400 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cozy-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-rose-400 text-xs uppercase font-bold tracking-[0.25em]">
              CMS Dashboard
            </p>
            <h1 className="text-4xl font-bold text-earthy-brown">
              Product Admin Panel
            </h1>
            <p className="text-gray-600 mt-2">
              Create and update storefront products from Supabase CMS.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Data Source
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                usingFallback
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {usingFallback ? "Static Fallback" : "Supabase CMS"}
            </span>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 text-amber-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
            {message}
          </div>
        )}

        {submitError && (
          <div className="rounded-2xl border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {submitError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-earthy-brown mb-6">
              {editingId ? "Edit Product" : "Add Product"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-earthy-brown mb-1">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                      slug: prev.slug ? prev.slug : slugify(event.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-earthy-brown mb-1">
                  Price (INR)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, price: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-earthy-brown mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      category: event.target.value as Product["category"],
                    }))
                  }
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-earthy-brown mb-1">
                  Image URL
                </label>
                <input
                  value={form.image}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, image: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-earthy-brown mb-1">
                  Slug
                </label>
                <input
                  value={form.slug}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      slug: slugify(event.target.value),
                    }))
                  }
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-earthy-brown mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <label className="flex items-center gap-3 text-sm font-bold text-earthy-brown">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      isFeatured: event.target.checked,
                    }))
                  }
                  className="h-4 w-4"
                />
                Show in featured section
              </label>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-3 bg-earthy-brown text-white rounded-2xl font-bold hover:bg-rose-400 transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {editingId ? <Save size={16} /> : <PlusCircle size={16} />}
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Product"
                      : "Add Product"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-3 border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={handleSeedDefaults}
                disabled={seeding}
                className="w-full px-5 py-3 border border-rose-200 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <RefreshCw
                  size={16}
                  className={seeding ? "animate-spin" : ""}
                />
                {seeding ? "Seeding..." : "Copy Default Catalog into CMS"}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-earthy-brown">
                Catalog ({products.length})
              </h2>
              {productsLoading && (
                <div className="w-6 h-6 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <p className="font-bold text-earthy-brown text-lg">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">/{product.slug}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        {product.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                        <span className="px-2 py-1 rounded-full bg-rose-50 text-rose-600 font-bold">
                          ₹{product.price.toFixed(2)}
                        </span>
                        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-bold uppercase">
                          {product.category}
                        </span>
                        {product.isFeatured && (
                          <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleEdit(product)}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 self-start"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>
                  </div>
                </div>
              ))}

              {products.length === 0 && !productsLoading && (
                <div className="text-center py-12 text-gray-500">
                  No products found in CMS yet.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
