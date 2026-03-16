"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Tag,
  Sparkles,
  Archive,
  FileEdit,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  adminFetchProducts,
  adminFetchCategories,
  getReadableCmsError,
} from "@/services/productCmsService";
import { Product, Category } from "@/types/types";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    Promise.all([adminFetchProducts(), adminFetchCategories()])
      .then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
      })
      .catch((err) => setError(getReadableCmsError(err)))
      .finally(() => setLoading(false));
  }, []);

  const active = products.filter((p) => p.status === "active").length;
  const drafts = products.filter((p) => p.status === "draft").length;
  const archived = products.filter((p) => p.status === "archived").length;
  const featured = products.filter((p) => p.isFeatured).length;
  const recent = [...products]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 6);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome to your store CMS
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors"
        >
          <PlusCircle size={16} />
          New Product
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error} - make sure you have run the database migrations.
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Products"
            value={products.length}
            icon={Package}
            color="bg-rose-500"
          />
          <StatCard
            label="Active"
            value={active}
            icon={TrendingUp}
            color="bg-emerald-500"
          />
          <StatCard
            label="Drafts"
            value={drafts}
            icon={FileEdit}
            color="bg-amber-500"
          />
          <StatCard
            label="Featured"
            value={featured}
            icon={Sparkles}
            color="bg-violet-500"
          />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2 font-semibold text-gray-800">
              <Clock size={16} />
              Recent Products
            </div>
            <Link
              href="/admin/products"
              className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              No products yet.{" "}
              <Link
                href="/admin/products/new"
                className="text-rose-500 underline"
              >
                Create your first product
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recent.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                  >
                    {p.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.thumbnailUrl}
                        alt={p.name}
                        className="w-9 h-9 rounded-lg object-cover shrink-0 bg-gray-100"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <Package size={14} className="text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        ?{p.price.toFixed(2)}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : p.status === "draft"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  href: "/admin/products/new",
                  icon: PlusCircle,
                  label: "New Product",
                  color: "bg-rose-50 text-rose-600 hover:bg-rose-100",
                },
                {
                  href: "/admin/categories",
                  icon: Tag,
                  label: "Manage Categories",
                  color: "bg-violet-50 text-violet-600 hover:bg-violet-100",
                },
                {
                  href: "/admin/products?status=draft",
                  icon: FileEdit,
                  label: `${drafts} Drafts`,
                  color: "bg-amber-50 text-amber-600 hover:bg-amber-100",
                },
                {
                  href: "/admin/products?status=archived",
                  icon: Archive,
                  label: `${archived} Archived`,
                  color: "bg-gray-50 text-gray-600 hover:bg-gray-100",
                },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-colors ${action.color}`}
                >
                  <action.icon size={15} />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Categories</h2>
              <Link
                href="/admin/categories"
                className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"
              >
                Manage <ArrowRight size={12} />
              </Link>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-8 bg-gray-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-gray-400">
                No categories yet.{" "}
                <Link
                  href="/admin/categories"
                  className="text-rose-500 underline"
                >
                  Create one
                </Link>
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span
                    key={cat.id}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      cat.isActive
                        ? "bg-rose-50 text-rose-600"
                        : "bg-gray-100 text-gray-400 line-through"
                    }`}
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
