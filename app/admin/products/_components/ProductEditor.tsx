"use client";

/**
 * ProductEditor – shared component used by /admin/products/new and /admin/products/[id]
 *
 * Features:
 *  · General info: name, slug (auto-generated), short description, description
 *  · Media: multiple image upload (file + URL), thumbnail selection, reorder, remove
 *  · Pricing: price, compare-at price, cost per item
 *  · Inventory: SKU, barcode, track qty, quantity, in-stock, allow backorder
 *  · Shipping: weight, dimensions
 *  · Organisation: category, tags, featured, new, sort order
 *  · SEO: title, description overrides
 *  · Variants: dynamic list with per-variant attributes
 *  · Custom fields: key-value pairs stored as JSON
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  X,
  Star,
  StarOff,
  Upload,
  ChevronDown,
  ChevronUp,
  Trash2,
  Link2,
  GripVertical,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminSyncProductImages,
  adminSyncProductVariants,
  adminUploadImage,
  adminDeleteImageFromStorage,
  adminFetchCategories,
  adminFetchProduct,
  getReadableCmsError,
  ProductWriteData,
} from "@/services/productCmsService";
import { Category, ProductStatus } from "@/types/types";

// ─── Types ───────────────────────────────────────────────────────────────────

type ImageDraft = {
  /** undefined = not yet persisted */
  id?: string;
  url: string;
  storagePath?: string;
  alt: string;
  isThumbnail: boolean;
  /** file selected but not yet uploaded */
  pendingFile?: File;
  uploading?: boolean;
  error?: string;
};

type VariantDraft = {
  id?: string;
  name: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  quantity: string;
  inStock: boolean;
  attributes: { key: string; value: string }[];
};

type CustomField = { key: string; value: string };

type FormState = {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  status: ProductStatus;
  categoryId: string;
  tags: string;
  price: string;
  compareAtPrice: string;
  costPerItem: string;
  sku: string;
  barcode: string;
  inStock: boolean;
  quantity: string;
  trackQuantity: boolean;
  allowBackorder: boolean;
  weight: string;
  weightUnit: string;
  length: string;
  width: string;
  height: string;
  dimensionUnit: string;
  isFeatured: boolean;
  isNew: boolean;
  sortOrder: string;
  seoTitle: string;
  seoDescription: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  status: "draft",
  categoryId: "",
  tags: "",
  price: "",
  compareAtPrice: "",
  costPerItem: "",
  sku: "",
  barcode: "",
  inStock: true,
  quantity: "",
  trackQuantity: false,
  allowBackorder: false,
  weight: "",
  weightUnit: "g",
  length: "",
  width: "",
  height: "",
  dimensionUnit: "cm",
  isFeatured: false,
  isNew: false,
  sortOrder: "0",
  seoTitle: "",
  seoDescription: "",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const slugify = (v: string) =>
  v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseMoney = (v: string) => {
  const n = parseFloat(v);
  return isNaN(n) ? undefined : n;
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>
        {open ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-700">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 placeholder-gray-300";

// ─── Image Manager ────────────────────────────────────────────────────────────

function ImageManager({
  images,
  onChange,
  productId,
}: {
  images: ImageDraft[];
  onChange: React.Dispatch<React.SetStateAction<ImageDraft[]>>;
  productId?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [urlAlt, setUrlAlt] = useState("");

  const uploadFile = useCallback(
    async (file: File, idx: number) => {
      const tempId = productId ?? `tmp-${Date.now()}`;
      try {
        onChange((prev) =>
          prev.map((img, i) =>
            i === idx ? { ...img, uploading: true, error: undefined } : img,
          ),
        );
        const { url, storagePath } = await adminUploadImage(file, tempId);
        onChange((prev) =>
          prev.map((img, i) =>
            i === idx
              ? {
                  ...img,
                  url,
                  storagePath,
                  uploading: false,
                  pendingFile: undefined,
                }
              : img,
          ),
        );
      } catch (err) {
        onChange((prev) =>
          prev.map((img, i) =>
            i === idx
              ? { ...img, uploading: false, error: getReadableCmsError(err) }
              : img,
          ),
        );
      }
    },
    [onChange, productId],
  );

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const startIndex = images.length;
    const newImgs: ImageDraft[] = Array.from(files).map((f) => ({
      url: URL.createObjectURL(f),
      alt: f.name.replace(/\.[^.]+$/, ""),
      isThumbnail: images.length === 0,
      pendingFile: f,
      uploading: false,
    }));
    onChange((prev) => [...prev, ...newImgs]);
    // kick off uploads
    newImgs.forEach((img, idx) => {
      const realIdx = startIndex + idx;
      if (img.pendingFile) {
        void uploadFile(img.pendingFile, realIdx);
      }
    });
  };

  const addUrl = () => {
    if (!urlInput.trim()) return;
    onChange((prev) => [
      ...prev,
      {
        url: urlInput.trim(),
        alt: urlAlt.trim() || urlInput.trim(),
        isThumbnail: prev.length === 0,
      },
    ]);
    setUrlInput("");
    setUrlAlt("");
  };

  const remove = async (idx: number) => {
    const img = images[idx];
    if (img.storagePath) {
      try {
        await adminDeleteImageFromStorage(img.storagePath);
      } catch {
        // ignore storage errors on removal
      }
    }
    const next = images.filter((_, i) => i !== idx);
    // ensure there's always 1 thumbnail if any images remain
    if (
      img.isThumbnail &&
      next.length > 0 &&
      !next.some((x) => x.isThumbnail)
    ) {
      next[0] = { ...next[0], isThumbnail: true };
    }
    onChange(next);
  };

  const setThumb = (idx: number) =>
    onChange((prev) =>
      prev.map((img, i) => ({ ...img, isThumbnail: i === idx })),
    );

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...images];
    const to = idx + dir;
    if (to < 0 || to >= next.length) return;
    [next[idx], next[to]] = [next[to], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {/* Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-full object-cover"
              />
              {/* Uploading overlay */}
              {img.uploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <Loader2 size={20} className="animate-spin text-rose-400" />
                </div>
              )}
              {/* Error overlay */}
              {img.error && (
                <div className="absolute inset-0 bg-red-50/90 flex flex-col items-center justify-center p-1 text-center">
                  <AlertCircle size={14} className="text-red-500 mb-1" />
                  <p className="text-xs text-red-600 leading-tight">
                    {img.error}
                  </p>
                </div>
              )}
              {/* Thumbnail badge */}
              {img.isThumbnail && (
                <div className="absolute top-1 left-1 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                  Thumb
                </div>
              )}
              {/* Controls */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setThumb(idx)}
                  title="Set as thumbnail"
                  className="p-1 bg-white rounded-lg hover:bg-rose-50"
                >
                  {img.isThumbnail ? (
                    <Star size={13} className="text-rose-500" />
                  ) : (
                    <StarOff size={13} className="text-gray-600" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="p-1 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronUp size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, 1)}
                  disabled={idx === images.length - 1}
                  className="p-1 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-30"
                >
                  <ChevronDown size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="p-1 bg-white rounded-lg hover:bg-red-50 text-red-500"
                >
                  <Trash2 size={13} />
                </button>
              </div>
              {/* Alt text */}
              <input
                type="text"
                value={img.alt}
                onChange={(e) =>
                  onChange((prev) =>
                    prev.map((x, i) =>
                      i === idx ? { ...x, alt: e.target.value } : x,
                    ),
                  )
                }
                placeholder="Alt text"
                className="absolute bottom-0 left-0 right-0 text-[10px] bg-black/60 text-white px-1.5 py-0.5 border-0 outline-none placeholder-white/50 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ))}
        </div>
      )}

      {/* Upload actions */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-600 hover:border-rose-400 hover:text-rose-500 transition-colors"
        >
          <Upload size={15} />
          Upload images
        </button>
        <input
          type="file"
          ref={fileRef}
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Add by URL */}
        <div className="flex gap-2 flex-1 min-w-65">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Or paste image URL…"
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addUrl())
            }
          />
          <input
            type="text"
            value={urlAlt}
            onChange={(e) => setUrlAlt(e.target.value)}
            placeholder="Alt text"
            className="w-28 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          <button
            type="button"
            onClick={addUrl}
            disabled={!urlInput.trim()}
            className="px-3 py-2 bg-gray-900 text-white rounded-xl text-sm hover:bg-gray-700 disabled:opacity-40 transition-colors"
          >
            <Link2 size={15} />
          </button>
        </div>
      </div>

      {images.length > 0 && (
        <p className="text-xs text-gray-400">
          <Star size={11} className="inline mr-0.5 text-rose-400" />
          Click the star on any image to set it as the product thumbnail.
        </p>
      )}
    </div>
  );
}

// ─── Variants ────────────────────────────────────────────────────────────────

function VariantRow({
  variant,
  onChange,
  onRemove,
}: {
  variant: VariantDraft;
  onChange: (v: VariantDraft) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);

  const addAttr = () =>
    onChange({
      ...variant,
      attributes: [...variant.attributes, { key: "", value: "" }],
    });
  const removeAttr = (i: number) =>
    onChange({
      ...variant,
      attributes: variant.attributes.filter((_, idx) => idx !== i),
    });
  const setAttr = (i: number, field: "key" | "value", val: string) =>
    onChange({
      ...variant,
      attributes: variant.attributes.map((a, idx) =>
        idx === i ? { ...a, [field]: val } : a,
      ),
    });

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <GripVertical size={14} className="text-gray-400" />
          <span className="font-medium text-sm text-gray-700">
            {variant.name || "Unnamed variant"}
          </span>
          {variant.price && (
            <span className="text-xs text-gray-400">₹{variant.price}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} />
          </button>
          {open ? (
            <ChevronUp size={14} className="text-gray-400" />
          ) : (
            <ChevronDown size={14} className="text-gray-400" />
          )}
        </div>
      </button>

      {open && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Variant Name" required>
              <input
                type="text"
                value={variant.name}
                onChange={(e) => onChange({ ...variant, name: e.target.value })}
                placeholder="e.g. Size M / Red"
                className={inputCls}
              />
            </Field>
            <Field label="SKU">
              <input
                type="text"
                value={variant.sku}
                onChange={(e) => onChange({ ...variant, sku: e.target.value })}
                placeholder="VARIANT-SKU"
                className={inputCls}
              />
            </Field>
            <Field
              label="Price Override (₹)"
              hint="Leave empty to inherit product price"
            >
              <input
                type="number"
                min="0"
                step="0.01"
                value={variant.price}
                onChange={(e) =>
                  onChange({ ...variant, price: e.target.value })
                }
                placeholder="—"
                className={inputCls}
              />
            </Field>
            <Field label="Compare At (₹)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={variant.compareAtPrice}
                onChange={(e) =>
                  onChange({ ...variant, compareAtPrice: e.target.value })
                }
                placeholder="—"
                className={inputCls}
              />
            </Field>
            <Field label="Quantity">
              <input
                type="number"
                min="0"
                value={variant.quantity}
                onChange={(e) =>
                  onChange({ ...variant, quantity: e.target.value })
                }
                className={inputCls}
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={variant.inStock}
              onChange={(e) =>
                onChange({ ...variant, inStock: e.target.checked })
              }
              className="rounded"
            />
            In stock
          </label>

          {/* Attributes */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600">
              Attributes (e.g. Color → Red, Size → M)
            </p>
            {variant.attributes.map((attr, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={attr.key}
                  onChange={(e) => setAttr(i, "key", e.target.value)}
                  placeholder="Attribute"
                  className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
                <input
                  type="text"
                  value={attr.value}
                  onChange={(e) => setAttr(i, "value", e.target.value)}
                  placeholder="Value"
                  className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
                <button
                  type="button"
                  onClick={() => removeAttr(i)}
                  className="text-red-400 hover:text-red-600 px-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addAttr}
              className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"
            >
              <Plus size={12} /> Add attribute
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Editor ──────────────────────────────────────────────────────────────

export interface ProductEditorProps {
  productId?: string; // undefined = new product
}

export default function ProductEditor({ productId }: ProductEditorProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [images, setImages] = useState<ImageDraft[]>([]);
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialising, setInitialising] = useState(!!productId);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isNew = !productId;
  // track product id after creation so images use the real id
  const resolvedIdRef = useRef<string | undefined>(productId);

  const set = (key: keyof FormState, value: FormState[keyof FormState]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // auto-slug when name changes (new products only)
  const prevNameRef = useRef("");
  useEffect(() => {
    if (!isNew) return;
    if (form.name !== prevNameRef.current) {
      prevNameRef.current = form.name;
      if (!form.slug || form.slug === slugify(prevNameRef.current)) {
        set("slug", slugify(form.name));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name]);

  // Load categories + existing product data
  useEffect(() => {
    const init = async () => {
      try {
        const cats = await adminFetchCategories();
        setCategories(cats);

        if (productId) {
          const product = await adminFetchProduct(productId);
          if (product) {
            setForm({
              name: product.name,
              slug: product.slug,
              shortDescription: product.shortDescription ?? "",
              description: product.description ?? "",
              status: product.status,
              categoryId: product.categoryId ?? "",
              tags: (product.tags ?? []).join(", "),
              price: String(product.price),
              compareAtPrice:
                product.compareAtPrice != null
                  ? String(product.compareAtPrice)
                  : "",
              costPerItem:
                product.costPerItem != null ? String(product.costPerItem) : "",
              sku: product.sku ?? "",
              barcode: product.barcode ?? "",
              inStock: product.inStock,
              quantity:
                product.quantity != null ? String(product.quantity) : "",
              trackQuantity: product.trackQuantity,
              allowBackorder: product.allowBackorder,
              weight: product.weight != null ? String(product.weight) : "",
              weightUnit: product.weightUnit ?? "g",
              length: product.length != null ? String(product.length) : "",
              width: product.width != null ? String(product.width) : "",
              height: product.height != null ? String(product.height) : "",
              dimensionUnit: product.dimensionUnit ?? "cm",
              isFeatured: product.isFeatured,
              isNew: product.isNew,
              sortOrder: String(product.sortOrder),
              seoTitle: product.seoTitle ?? "",
              seoDescription: product.seoDescription ?? "",
            });

            setImages(
              (product.images ?? []).map((img) => ({
                id: img.id,
                url: img.url,
                storagePath: img.storagePath,
                alt: img.alt,
                isThumbnail: img.isThumbnail,
              })),
            );

            setVariants(
              (product.variants ?? []).map((v) => ({
                id: v.id,
                name: v.name,
                sku: v.sku ?? "",
                price: v.price != null ? String(v.price) : "",
                compareAtPrice:
                  v.compareAtPrice != null ? String(v.compareAtPrice) : "",
                quantity: v.quantity != null ? String(v.quantity) : "",
                inStock: v.inStock,
                attributes: Object.entries(v.attributes).map(
                  ([key, value]) => ({ key, value }),
                ),
              })),
            );

            if (product.customFields) {
              setCustomFields(
                Object.entries(product.customFields).map(([key, value]) => ({
                  key,
                  value: String(value),
                })),
              );
            }
          } else {
            setSaveError("Product not found. It may have been deleted.");
          }
        }
      } catch (err) {
        setSaveError(getReadableCmsError(err));
      } finally {
        setInitialising(false);
      }
    };
    init();
  }, [productId]);

  const buildWriteData = (): ProductWriteData => ({
    name: form.name.trim(),
    slug: slugify(form.slug || form.name),
    description: form.description.trim() || undefined,
    shortDescription: form.shortDescription.trim() || undefined,
    status: form.status,
    categoryId: form.categoryId || undefined,
    price: parseMoney(form.price) ?? 0,
    compareAtPrice: parseMoney(form.compareAtPrice),
    costPerItem: parseMoney(form.costPerItem),
    thumbnailUrl:
      images.find((i) => i.isThumbnail)?.url || images[0]?.url || undefined,
    sku: form.sku.trim() || undefined,
    barcode: form.barcode.trim() || undefined,
    inStock: form.inStock,
    quantity:
      form.trackQuantity && form.quantity ? parseInt(form.quantity) : undefined,
    trackQuantity: form.trackQuantity,
    allowBackorder: form.allowBackorder,
    weight: parseMoney(form.weight),
    weightUnit: form.weightUnit || "g",
    length: parseMoney(form.length),
    width: parseMoney(form.width),
    height: parseMoney(form.height),
    dimensionUnit: form.dimensionUnit || "cm",
    tags: form.tags
      ? form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    isFeatured: form.isFeatured,
    isNew: form.isNew,
    sortOrder: parseInt(form.sortOrder) || 0,
    seoTitle: form.seoTitle.trim() || undefined,
    seoDescription: form.seoDescription.trim() || undefined,
    customFields:
      customFields.length > 0
        ? Object.fromEntries(customFields.map((f) => [f.key, f.value]))
        : undefined,
  });

  const previewImageUrls = images
    .map((img) => img.url)
    .filter((url) => Boolean(url));
  const previewPrimaryImage =
    images.find((img) => img.isThumbnail)?.url ||
    previewImageUrls[0] ||
    "https://picsum.photos/800/800";
  const previewName = form.name.trim() || "Untitled Product";
  const previewDescription =
    form.shortDescription.trim() ||
    form.description.trim() ||
    "Product description preview";
  const previewPrice = parseMoney(form.price) ?? 0;
  const previewCategory =
    categories.find((category) => category.id === form.categoryId)?.name ||
    "Uncategorized";

  const validate = (): string | null => {
    if (!form.name.trim()) return "Product name is required.";
    if (!form.price.trim() || isNaN(parseFloat(form.price)))
      return "A valid price is required.";
    if (parseFloat(form.price) < 0) return "Price cannot be negative.";
    return null;
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaveError(null);

    const validationError = validate();
    if (validationError) {
      setSaveError(validationError);
      return;
    }

    // Check any images are still uploading
    if (images.some((img) => img.uploading)) {
      setSaveError("Please wait for image uploads to complete.");
      return;
    }

    setLoading(true);
    try {
      const data = buildWriteData();

      let id: string;
      if (isNew) {
        id = await adminCreateProduct(data);
        resolvedIdRef.current = id;
      } else {
        id = productId!;
        await adminUpdateProduct(id, data);
      }

      // Sync images (re-upload pending files with real product id if needed)
      const finalImages = await Promise.all(
        images.map(async (img) => {
          if (img.pendingFile) {
            try {
              const { url, storagePath } = await adminUploadImage(
                img.pendingFile,
                id,
              );
              return {
                ...img,
                url,
                storagePath,
                pendingFile: undefined,
                uploading: false,
              };
            } catch {
              return img;
            }
          }
          return img;
        }),
      );

      await adminSyncProductImages(
        id,
        finalImages.map((img) => ({
          url: img.url,
          storagePath: img.storagePath,
          alt: img.alt,
          isThumbnail: img.isThumbnail,
          sortOrder: 0, // managed by array order
        })),
      );

      // Update thumbnailUrl on product if images have been set
      const thumbUrl =
        finalImages.find((i) => i.isThumbnail)?.url || finalImages[0]?.url;
      if (thumbUrl && thumbUrl !== data.thumbnailUrl) {
        await adminUpdateProduct(id, { ...data, thumbnailUrl: thumbUrl });
      }

      // Sync variants
      await adminSyncProductVariants(
        id,
        variants.map((v) => ({
          name: v.name,
          sku: v.sku || undefined,
          price: parseMoney(v.price),
          compareAtPrice: parseMoney(v.compareAtPrice),
          quantity: v.quantity ? parseInt(v.quantity) : undefined,
          inStock: v.inStock,
          attributes: Object.fromEntries(
            v.attributes
              .filter((a) => a.key.trim())
              .map((a) => [a.key, a.value]),
          ),
        })),
      );

      setImages(finalImages);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);

      if (isNew) {
        // redirect to edit page
        window.location.href = `/admin/products/${id}`;
      }
    } catch (err) {
      setSaveError(getReadableCmsError(err));
    } finally {
      setLoading(false);
    }
  };

  if (initialising) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-rose-400" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="min-h-screen">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
        <Link
          href="/admin/products"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Products
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-800 truncate max-w-50">
          {form.name || (isNew ? "New Product" : "Edit Product")}
        </span>
        <div className="ml-auto flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircle2 size={16} /> Saved
            </span>
          )}
          {saveError && (
            <span className="flex items-center gap-1.5 text-sm text-red-600 max-w-65 truncate">
              <AlertCircle size={16} /> {saveError}
            </span>
          )}
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value as ProductStatus)}
            className="text-sm border border-gray-300 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 disabled:opacity-60 transition-colors"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isNew ? "Save & Publish" : "Save"}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 grid lg:grid-cols-[1fr_300px] gap-6 max-w-6xl mx-auto">
        {/* ── Left column ── */}
        <div className="space-y-5">
          {/* General */}
          <Section title="General Information">
            <Field label="Product Name" required>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Mochi the Chubby Cat"
                className={inputCls}
                autoFocus
              />
            </Field>
            <Field
              label="Slug"
              hint="URL-friendly identifier, auto-generated from name"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 shrink-0">/shop/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => set("slug", slugify(e.target.value))}
                  placeholder="mochi-the-chubby-cat"
                  className={inputCls}
                />
              </div>
            </Field>
            <Field
              label="Short Description"
              hint="Displayed on product cards (optional)"
            >
              <input
                type="text"
                value={form.shortDescription}
                onChange={(e) => set("shortDescription", e.target.value)}
                placeholder="One-line summary…"
                className={inputCls}
                maxLength={160}
              />
            </Field>
            <Field label="Description">
              <textarea
                rows={6}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Detailed product description…"
                className={`${inputCls} resize-y`}
              />
            </Field>
          </Section>

          {/* Media */}
          <Section title="Media">
            <ImageManager
              images={images}
              onChange={setImages}
              productId={resolvedIdRef.current}
            />
          </Section>

          <Section title="Live Storefront Preview" defaultOpen>
            <p className="text-xs text-gray-500">
              Instant preview of how this product will look in the shop card and
              product detail page.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
                <div className="px-3 py-2 border-b border-gray-100 text-xs font-medium text-gray-500">
                  Product Card Preview
                </div>
                <div className="p-3">
                  <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100">
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewPrimaryImage}
                        alt={previewName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 bg-white/90 backdrop-blur px-3 py-1 rounded-tr-xl">
                        <span className="text-[11px] font-bold text-earthy-brown uppercase tracking-wider">
                          {previewCategory}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-bold text-gray-800 line-clamp-1">
                        {previewName}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {previewDescription}
                      </p>
                      <p className="text-base font-bold text-earthy-brown">
                        ₹{previewPrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
                <div className="px-3 py-2 border-b border-gray-100 text-xs font-medium text-gray-500">
                  Product Page Preview
                </div>
                <div className="p-3 space-y-3">
                  <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewPrimaryImage}
                      alt={previewName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      {previewCategory}
                    </p>
                    <h3 className="text-lg font-bold text-earthy-brown line-clamp-1">
                      {previewName}
                    </h3>
                    <p className="text-lg font-bold text-rose-500">
                      ₹{previewPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {previewDescription}
                    </p>
                  </div>
                  {previewImageUrls.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {previewImageUrls.slice(0, 4).map((url, index) => (
                        <div
                          key={`${url}-${index}`}
                          className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shrink-0"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={`${previewName} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Section>

          {/* Variants */}
          <Section title="Variants" defaultOpen={variants.length > 0}>
            <p className="text-xs text-gray-500 mb-3">
              Add variants for different options like size, colour, or material.
            </p>
            <div className="space-y-3">
              {variants.map((v, i) => (
                <VariantRow
                  key={i}
                  variant={v}
                  onChange={(updated) =>
                    setVariants((prev) =>
                      prev.map((x, idx) => (idx === i ? updated : x)),
                    )
                  }
                  onRemove={() =>
                    setVariants((prev) => prev.filter((_, idx) => idx !== i))
                  }
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setVariants((prev) => [
                  ...prev,
                  {
                    name: "",
                    sku: "",
                    price: "",
                    compareAtPrice: "",
                    quantity: "",
                    inStock: true,
                    attributes: [],
                  },
                ])
              }
              className="mt-3 flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-600 hover:border-rose-400 hover:text-rose-500 transition-colors w-full justify-center"
            >
              <Plus size={15} /> Add variant
            </button>
          </Section>

          {/* Custom Fields */}
          <Section title="Custom Fields" defaultOpen={customFields.length > 0}>
            <p className="text-xs text-gray-500 mb-3">
              Add any extra data you need — stored as flexible key/value pairs.
            </p>
            <div className="space-y-2">
              {customFields.map((field, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) =>
                      setCustomFields((prev) =>
                        prev.map((f, idx) =>
                          idx === i ? { ...f, key: e.target.value } : f,
                        ),
                      )
                    }
                    placeholder="key"
                    className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) =>
                      setCustomFields((prev) =>
                        prev.map((f, idx) =>
                          idx === i ? { ...f, value: e.target.value } : f,
                        ),
                      )
                    }
                    placeholder="value"
                    className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setCustomFields((prev) =>
                        prev.filter((_, idx) => idx !== i),
                      )
                    }
                    className="text-red-400 hover:text-red-600 px-1 transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setCustomFields((prev) => [...prev, { key: "", value: "" }])
              }
              className="mt-2 flex items-center gap-1.5 text-sm text-rose-500 hover:text-rose-600 transition-colors"
            >
              <Plus size={14} /> Add field
            </button>
          </Section>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-5">
          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-semibold text-gray-800 text-sm">Pricing</h2>
            <Field label="Price (₹)" required>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
                placeholder="0.00"
                className={inputCls}
              />
            </Field>
            <Field label="Compare at Price (₹)" hint="Shown as strikethrough">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.compareAtPrice}
                onChange={(e) => set("compareAtPrice", e.target.value)}
                placeholder="—"
                className={inputCls}
              />
            </Field>
            <Field label="Cost per Item (₹)" hint="Not shown to customers">
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.costPerItem}
                onChange={(e) => set("costPerItem", e.target.value)}
                placeholder="—"
                className={inputCls}
              />
            </Field>
            {parseMoney(form.price) && parseMoney(form.costPerItem) ? (
              <p className="text-xs text-emerald-600">
                Margin: ₹
                {(
                  (parseMoney(form.price) ?? 0) -
                  (parseMoney(form.costPerItem) ?? 0)
                ).toFixed(2)}{" "}
                (
                {(
                  (((parseMoney(form.price) ?? 0) -
                    (parseMoney(form.costPerItem) ?? 0)) /
                    (parseMoney(form.price) ?? 1)) *
                  100
                ).toFixed(0)}
                %)
              </p>
            ) : null}
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-semibold text-gray-800 text-sm">Inventory</h2>
            <Field label="SKU">
              <input
                type="text"
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                placeholder="WK-001"
                className={inputCls}
              />
            </Field>
            <Field label="Barcode">
              <input
                type="text"
                value={form.barcode}
                onChange={(e) => set("barcode", e.target.value)}
                placeholder="UPC / EAN"
                className={inputCls}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(e) => set("inStock", e.target.checked)}
                className="rounded"
              />
              In stock
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.trackQuantity}
                onChange={(e) => set("trackQuantity", e.target.checked)}
                className="rounded"
              />
              Track quantity
            </label>
            {form.trackQuantity && (
              <Field label="Quantity">
                <input
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(e) => set("quantity", e.target.value)}
                  className={inputCls}
                />
              </Field>
            )}
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allowBackorder}
                onChange={(e) => set("allowBackorder", e.target.checked)}
                className="rounded"
              />
              Allow backorder
            </label>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-semibold text-gray-800 text-sm">Shipping</h2>
            <div className="flex gap-2">
              <Field label="Weight">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.weight}
                  onChange={(e) => set("weight", e.target.value)}
                  placeholder="0"
                  className={inputCls}
                />
              </Field>
              <Field label="Unit">
                <select
                  value={form.weightUnit}
                  onChange={(e) => set("weightUnit", e.target.value)}
                  className={inputCls}
                >
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                  <option value="oz">oz</option>
                </select>
              </Field>
            </div>
            <p className="text-xs font-medium text-gray-600">Dimensions</p>
            <div className="grid grid-cols-3 gap-2">
              {(["length", "width", "height"] as const).map((dim) => (
                <Field
                  key={dim}
                  label={dim.charAt(0).toUpperCase() + dim.slice(1)}
                >
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={form[dim]}
                    onChange={(e) => set(dim, e.target.value)}
                    placeholder="0"
                    className={inputCls}
                  />
                </Field>
              ))}
            </div>
            <Field label="Dimension Unit">
              <select
                value={form.dimensionUnit}
                onChange={(e) => set("dimensionUnit", e.target.value)}
                className={inputCls}
              >
                <option value="cm">cm</option>
                <option value="in">in</option>
                <option value="mm">mm</option>
              </select>
            </Field>
          </div>

          {/* Organisation */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-semibold text-gray-800 text-sm">
              Organisation
            </h2>
            <Field label="Category">
              <select
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className={inputCls}
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label="Tags"
              hint="Comma-separated — e.g. handmade, gift, amigurumi"
            >
              <input
                type="text"
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
                placeholder="handmade, gift…"
                className={inputCls}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => set("isFeatured", e.target.checked)}
                className="rounded"
              />
              Featured product
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) => set("isNew", e.target.checked)}
                className="rounded"
              />
              Mark as new
            </label>
            <Field label="Sort Order" hint="Lower = appears first">
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => set("sortOrder", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-semibold text-gray-800 text-sm">SEO</h2>
            <Field label="SEO Title" hint="Defaults to product name">
              <input
                type="text"
                value={form.seoTitle}
                onChange={(e) => set("seoTitle", e.target.value)}
                placeholder={form.name || "Product name"}
                className={inputCls}
                maxLength={70}
              />
              <p className="text-right text-[10px] text-gray-300">
                {form.seoTitle.length}/70
              </p>
            </Field>
            <Field label="SEO Description" hint="Shown in search results">
              <textarea
                rows={3}
                value={form.seoDescription}
                onChange={(e) => set("seoDescription", e.target.value)}
                placeholder={
                  form.shortDescription ||
                  form.description?.slice(0, 160) ||
                  "Description…"
                }
                className={`${inputCls} resize-none`}
                maxLength={160}
              />
              <p className="text-right text-[10px] text-gray-300">
                {form.seoDescription.length}/160
              </p>
            </Field>
          </div>
        </div>
      </div>
    </form>
  );
}
