import { Category, Product } from "@/types/types";
import {
  CategoryWriteData,
  ProductWriteData,
  adminCreateCategory,
  adminCreateProduct,
  adminDeleteCategory,
  adminDeleteImageFromStorage,
  adminDeleteProduct,
  adminFetchCategories,
  adminFetchProduct,
  adminFetchProducts,
  adminSyncProductImages,
  adminSyncProductVariants,
  adminUpdateCategory,
  adminUpdateProduct,
  adminUploadImage,
  getReadableCmsError,
} from "@/services/productCmsService";

export type { CategoryWriteData, ProductWriteData };

export const getReadableAdminDbError = getReadableCmsError;

export type AdminDashboardData = {
  products: Product[];
  categories: Category[];
};

export type AdminProductsPageData = {
  products: Product[];
  categories: Category[];
};

export type AdminProductEditorData = {
  categories: Category[];
  product: Product | null;
};

export const adminLoadDashboardData = async (): Promise<AdminDashboardData> => {
  const [products, categories] = await Promise.all([
    adminFetchProducts(),
    adminFetchCategories(),
  ]);

  return { products, categories };
};

export const adminLoadProductsPageData =
  async (): Promise<AdminProductsPageData> => {
    const [products, categories] = await Promise.all([
      adminFetchProducts(),
      adminFetchCategories(),
    ]);

    return { products, categories };
  };

export const adminLoadProductEditorData = async (
  productId?: string,
): Promise<AdminProductEditorData> => {
  const [categories, product] = await Promise.all([
    adminFetchCategories(),
    productId ? adminFetchProduct(productId) : Promise.resolve(null),
  ]);

  return { categories, product };
};

export const adminLoadCategoriesPageData = async (): Promise<Category[]> =>
  adminFetchCategories();

export const adminDb = {
  loadDashboardData: adminLoadDashboardData,
  loadProductsPageData: adminLoadProductsPageData,
  loadProductEditorData: adminLoadProductEditorData,
  loadCategoriesPageData: adminLoadCategoriesPageData,
  createProduct: adminCreateProduct,
  updateProduct: adminUpdateProduct,
  deleteProduct: adminDeleteProduct,
  syncProductImages: adminSyncProductImages,
  syncProductVariants: adminSyncProductVariants,
  uploadImage: adminUploadImage,
  deleteImageFromStorage: adminDeleteImageFromStorage,
  createCategory: adminCreateCategory,
  updateCategory: adminUpdateCategory,
  deleteCategory: adminDeleteCategory,
};
