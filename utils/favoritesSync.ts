import { dbUserState, getReadableDbError } from "../lib/db";
import { fetchProducts } from "../services/productCmsService";
import { sanitizeFavoriteIds } from "./storeIntegrity";

// Sync favorites to Supabase
export const syncFavoritesToSupabase = async (
  userId: string,
  favorites: string[],
) => {
  try {
    await dbUserState.upsert({ userId, favorites });
  } catch (error) {
    console.error(
      "Failed to sync favorites to Supabase:",
      getReadableDbError(error),
      error,
    );
  }
};

// Listen for favorite changes and sync to Supabase
export const setupFavoritesSync = (userId: string | null) => {
  if (!userId) return;

  const handleFavoritesChange = () => {
    const sync = async () => {
      const favoritesRaw = JSON.parse(
        localStorage.getItem("favorites") || "[]",
      );
      const products = await fetchProducts();
      const favorites = sanitizeFavoriteIds(favoritesRaw, products);

      if (JSON.stringify(favoritesRaw) !== JSON.stringify(favorites)) {
        localStorage.setItem("favorites", JSON.stringify(favorites));
      }

      await syncFavoritesToSupabase(userId, favorites);
    };

    void sync();
  };

  window.addEventListener("favoritesChanged", handleFavoritesChange);

  return () => {
    window.removeEventListener("favoritesChanged", handleFavoritesChange);
  };
};
