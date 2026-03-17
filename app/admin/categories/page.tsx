"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  adminFetchCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  CategoryWriteData,
  getReadableCmsError,
} from "@/services/adminDb";
import { Category } from "@/types/types";
import { slugify } from "@/utils/slugify";

// ─── Empty form state ─────────────────────────────────────────────────────────

const EMPTY_FORM: CategoryWriteData = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  parentId: undefined,
  isActive: true,
  sortOrder: 0,
  seoTitle: "",
  seoDescription: "",
};

// ─── Inline category form ─────────────────────────────────────────────────────

function CategoryForm({
  initial,
  categories,
  onSave,
  onCancel,
}: {
  initial: CategoryWriteData & { id?: string };
  categories: Category[];
  onSave: (data: CategoryWriteData & { id?: string }) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNew = !initial.id;

  const set = (
    key: keyof CategoryWriteData,
    value: CategoryWriteData[keyof CategoryWriteData],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  // auto-slug for new categories
  const prevNameRef = React.useRef("");
  useEffect(() => {
    if (!isNew) return;
    if (form.name !== prevNameRef.current) {
      const previousAutoSlug = slugify(prevNameRef.current);
      prevNameRef.current = form.name as string;
      setForm((prev) => {
        if (prev.slug && prev.slug !== previousAutoSlug) {
          return prev;
        }

        return {
          ...prev,
          slug: slugify((form.name as string) ?? ""),
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!String(form.name || "").trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    try {
      await onSave({ ...form, id: initial.id });
    } catch (err) {
      setError(getReadableCmsError(err));
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 placeholder-gray-300";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-4"
    >
      <h3 className="font-semibold text-gray-800 text-sm">
        {isNew ? "New Category" : "Edit Category"}
      </h3>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <AlertCircle size={14} /> {error}
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">
            Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={String(form.name ?? "")}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Amigurumi"
            className={inputCls}
            autoFocus
          />
        </div>

        {/* Slug */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Slug</label>
          <input
            type="text"
            value={String(form.slug ?? "")}
            onChange={(e) => set("slug", slugify(e.target.value))}
            placeholder="amigurumi"
            className={inputCls}
          />
        </div>

        {/* Description */}
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-gray-700">
            Description
          </label>
          <input
            type="text"
            value={String(form.description ?? "")}
            onChange={(e) => set("description", e.target.value)}
            placeholder="A short description…"
            className={inputCls}
          />
        </div>

        {/* Image URL */}
        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-gray-700">Image URL</label>
          <input
            type="url"
            value={String(form.imageUrl ?? "")}
            onChange={(e) => set("imageUrl", e.target.value)}
            placeholder="https://…"
            className={inputCls}
          />
        </div>

        {/* Parent category */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">
            Parent Category
          </label>
          <select
            value={form.parentId ?? ""}
            onChange={(e) => set("parentId", e.target.value || undefined)}
            className={inputCls}
          >
            <option value="">None (top-level)</option>
            {categories
              .filter((c) => c.id !== initial.id)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>

        {/* Sort order */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">
            Sort Order
          </label>
          <input
            type="number"
            value={form.sortOrder ?? 0}
            onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)}
            className={inputCls}
          />
        </div>

        {/* SEO Title */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">SEO Title</label>
          <input
            type="text"
            value={String(form.seoTitle ?? "")}
            onChange={(e) => set("seoTitle", e.target.value)}
            placeholder={String(form.name || "Category name")}
            className={inputCls}
            maxLength={70}
          />
        </div>

        {/* SEO Description */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">
            SEO Description
          </label>
          <input
            type="text"
            value={String(form.seoDescription ?? "")}
            onChange={(e) => set("seoDescription", e.target.value)}
            placeholder="Search result description…"
            className={inputCls}
            maxLength={160}
          />
        </div>

        {/* Is Active */}
        <div className="sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={!!form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="rounded"
            />
            Visible on storefront
          </label>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-xl border border-gray-300 hover:border-gray-400 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-60 transition-colors"
        >
          {saving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Check size={15} />
          )}
          {isNew ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<"name" | "sortOrder" | "createdAt">(
    "sortOrder",
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCategories(await adminFetchCategories());
    } catch (err) {
      setError(getReadableCmsError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = [...categories].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
    if (sortKey === "sortOrder") return (a.sortOrder - b.sortOrder) * dir;
    return (
      (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
    );
  });

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: typeof sortKey }) => {
    if (sortKey !== col)
      return <ChevronDown size={13} className="text-gray-300" />;
    return sortDir === "asc" ? (
      <ChevronUp size={13} className="text-rose-400" />
    ) : (
      <ChevronDown size={13} className="text-rose-400" />
    );
  };

  const handleCreate = async (data: CategoryWriteData) => {
    await adminCreateCategory(data);
    setCreating(false);
    await load();
  };

  const handleUpdate = async (data: CategoryWriteData & { id?: string }) => {
    if (!data.id) return;
    await adminUpdateCategory(data.id, data);
    setEditingId(null);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await adminDeleteCategory(id);
      await load();
    } catch (err) {
      setError(getReadableCmsError(err));
    } finally {
      setDeletingId(null);
    }
  };

  const parentOf = (id: string | undefined) =>
    id ? categories.find((c) => c.id === id)?.name : null;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {categories.length} categor{categories.length === 1 ? "y" : "ies"}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={load}
            disabled={loading}
            className="p-2 rounded-xl border border-gray-300 text-gray-500 hover:text-gray-800 hover:border-gray-400 transition-colors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => {
              setCreating(true);
              setEditingId(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors"
          >
            <Plus size={16} /> New Category
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Create form */}
      {creating && (
        <CategoryForm
          initial={EMPTY_FORM}
          categories={categories}
          onSave={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading && categories.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={24} className="animate-spin text-rose-400" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <p className="text-sm">No categories yet.</p>
            <button
              onClick={() => setCreating(true)}
              className="mt-3 text-sm text-rose-500 hover:text-rose-600 font-medium"
            >
              Create your first category
            </button>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1fr_1fr_80px_120px] gap-0 border-b border-gray-100 bg-gray-50">
              {[
                { label: "Name", key: "name" as const },
                { label: "Parent", key: null },
                { label: "Order", key: "sortOrder" as const },
                { label: "Active", key: null },
                { label: "", key: null },
              ].map(({ label, key }, i) => (
                <div
                  key={i}
                  onClick={() => key && handleSort(key)}
                  className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${key ? "cursor-pointer hover:text-gray-800 select-none flex items-center gap-1" : ""}`}
                >
                  {label}
                  {key && <SortIcon col={key} />}
                </div>
              ))}
            </div>

            {/* Rows */}
            {sorted.map((cat) => (
              <React.Fragment key={cat.id}>
                <div className="grid grid-cols-[2fr_1fr_1fr_80px_120px] gap-0 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors items-center">
                  {/* Name */}
                  <div className="px-4 py-3 flex items-center gap-3">
                    {cat.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-8 h-8 rounded-lg object-cover border border-gray-100"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs font-bold">
                        {cat.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {cat.name}
                      </p>
                      <p className="text-xs text-gray-400">/{cat.slug}</p>
                    </div>
                  </div>

                  {/* Parent */}
                  <div className="px-4 py-3 text-sm text-gray-500">
                    {parentOf(cat.parentId) ?? (
                      <span className="text-gray-300">—</span>
                    )}
                  </div>

                  {/* Sort order */}
                  <div className="px-4 py-3 text-sm text-gray-500">
                    {cat.sortOrder}
                  </div>

                  {/* Active */}
                  <div className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        cat.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {cat.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="px-4 py-3 flex items-center gap-1 justify-end">
                    <button
                      onClick={() => {
                        setEditingId(cat.id);
                        setCreating(false);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      disabled={deletingId === cat.id}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                    >
                      {deletingId === cat.id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Inline edit form */}
                {editingId === cat.id && (
                  <div className="px-4 pb-4 border-b border-gray-100">
                    <CategoryForm
                      initial={{
                        id: cat.id,
                        name: cat.name,
                        slug: cat.slug,
                        description: cat.description,
                        imageUrl: cat.imageUrl,
                        parentId: cat.parentId,
                        isActive: cat.isActive,
                        sortOrder: cat.sortOrder,
                        seoTitle: cat.seoTitle,
                        seoDescription: cat.seoDescription,
                      }}
                      categories={categories}
                      onSave={handleUpdate}
                      onCancel={() => setEditingId(null)}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
