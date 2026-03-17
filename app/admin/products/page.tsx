"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  PlusCircle,
  Search,
  Package,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Filter,
} from "lucide-react";
import { adminDb, getReadableAdminDbError } from "@/services/adminDbService";
import { Product, Category, ProductStatus } from "@/types/types";

const STATUS_LABELS: Record<ProductStatus | "all", string> = {
  all: "All",
  active: "Active",
  draft: "Draft",
  archived: "Archived",
};

const STATUS_COLORS: Record<ProductStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  draft: "bg-amber-100 text-amber-700",
  archived: "bg-gray-100 text-gray-500",
};

type SortKey = "name" | "price" | "status" | "updatedAt";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortAsc, setSortAsc] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const statusFilter = (searchParams.get("status") ?? "all") as
    | ProductStatus
    | "all";
  const categoryFilter = searchParams.get("category") ?? "all";

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { products: prods, categories: cats } =
        await adminDb.loadProductsPageData();
      setProducts(prods);
      setCategories(cats);
    } catch (err) {
      setError(getReadableAdminDbError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (statusFilter !== "all")
      list = list.filter((p) => p.status === statusFilter);
    if (categoryFilter !== "all")
      list = list.filter((p) => p.categoryId === categoryFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.sku ?? "").toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "price") cmp = a.price - b.price;
      else if (sortKey === "status") cmp = a.status.localeCompare(b.status);
      else
        cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [products, statusFilter, categoryFilter, search, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortAsc ? (
        <ChevronUp size={14} />
      ) : (
        <ChevronDown size={14} />
      )
    ) : (
      <ChevronDown size={14} className="opacity-30" />
    );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await adminDb.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(getReadableAdminDbError(err));
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const next: ProductStatus =
      product.status === "active" ? "draft" : "active";
    try {
      await adminDb.updateProduct(product.id, {
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        status: next,
        categoryId: product.categoryId,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        costPerItem: product.costPerItem,
        thumbnailUrl: product.thumbnailUrl,
        sku: product.sku,
        barcode: product.barcode,
        inStock: product.inStock,
        quantity: product.quantity,
        trackQuantity: product.trackQuantity,
        allowBackorder: product.allowBackorder,
        weight: product.weight,
        weightUnit: product.weightUnit,
        length: product.length,
        width: product.width,
        height: product.height,
        dimensionUnit: product.dimensionUnit,
        tags: product.tags,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        sortOrder: product.sortOrder,
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        customFields: product.customFields,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: next } : p)),
      );
    } catch (err) {
      alert(getReadableAdminDbError(err));
    }
  };

  const allSelected =
    filtered.length > 0 && filtered.every((p) => selected.has(p.id));
  const toggleSelectAll = () =>
    setSelected(allSelected ? new Set() : new Set(filtered.map((p) => p.id)));

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key);
    else params.set(key, value);
    router.push(`/admin/products?${params.toString()}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">{products.length} total</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors"
          >
            <PlusCircle size={16} />
            New Product
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Filters toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-50">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1">
          <Filter size={14} className="text-gray-400" />
          {(Object.keys(STATUS_LABELS) as (ProductStatus | "all")[]).map(
            (s) => (
              <button
                key={s}
                onClick={() => setFilter("status", s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-rose-500 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ),
          )}
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setFilter("category", e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left w-8">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600 w-12" />
                <th
                  className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:text-gray-900"
                  onClick={() => toggleSort("name")}
                >
                  <span className="flex items-center gap-1">
                    Product <SortIcon k="name" />
                  </span>
                </th>
                <th
                  className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:text-gray-900"
                  onClick={() => toggleSort("status")}
                >
                  <span className="flex items-center gap-1">
                    Status <SortIcon k="status" />
                  </span>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Category
                </th>
                <th
                  className="px-4 py-3 text-right font-medium text-gray-600 cursor-pointer hover:text-gray-900"
                  onClick={() => toggleSort("price")}
                >
                  <span className="flex items-center justify-end gap-1">
                    Price <SortIcon k="price" />
                  </span>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Inventory
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-4 py-3">
                      <div className="h-8 bg-gray-100 rounded-lg animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-16 text-center text-gray-400"
                  >
                    <Package size={32} className="mx-auto mb-3 opacity-30" />
                    <p>No products found.</p>
                    <Link
                      href="/admin/products/new"
                      className="text-rose-500 text-sm mt-1 inline-block hover:underline"
                    >
                      Create your first product →
                    </Link>
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const catName = categories.find(
                    (c) => c.id === p.categoryId,
                  )?.name;
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selected.has(p.id) ? "bg-rose-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(p.id)}
                          onChange={(e) => {
                            const next = new Set(selected);
                            if (e.target.checked) {
                              next.add(p.id);
                            } else {
                              next.delete(p.id);
                            }
                            setSelected(next);
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className=" py-3">
                        {p.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.thumbnailUrl}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <Package size={14} className="text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.slug}</p>
                        {p.sku && (
                          <p className="text-xs text-gray-400">SKU: {p.sku}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[p.status]}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {catName ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium text-gray-800">
                          ₹{p.price.toFixed(2)}
                        </span>
                        {p.compareAtPrice && (
                          <p className="text-xs text-gray-400 line-through">
                            ₹{p.compareAtPrice.toFixed(2)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {p.trackQuantity ? (
                          <span
                            className={`text-xs font-medium ${
                              (p.quantity ?? 0) > 0
                                ? "text-emerald-600"
                                : "text-red-500"
                            }`}
                          >
                            {p.quantity ?? 0} in stock
                          </span>
                        ) : (
                          <span
                            className={`text-xs ${p.inStock ? "text-emerald-600" : "text-red-500"}`}
                          >
                            {p.inStock ? "In stock" : "Out of stock"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleStatus(p)}
                            title={
                              p.status === "active"
                                ? "Set to draft"
                                : "Set to active"
                            }
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            {p.status === "active" ? (
                              <EyeOff size={15} />
                            ) : (
                              <Eye size={15} />
                            )}
                          </button>
                          <Link
                            href={`/admin/products/${p.id}`}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Pencil size={15} />
                          </Link>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            disabled={deleting === p.id}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} of {products.length} products
            {selected.size > 0 && (
              <span className="ml-2 font-medium text-rose-600">
                · {selected.size} selected
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
