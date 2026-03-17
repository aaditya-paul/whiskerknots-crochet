// Deprecated shim. Admin pages now import directly from lib/db.
export {
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
  getReadableDbError as getReadableAdminDbError,
  type CategoryWriteData,
  type ProductWriteData,
} from "@/lib/db";
