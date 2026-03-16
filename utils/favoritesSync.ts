import { supabase } from "../lib/supabase";
import { getReadableSupabaseError } from "../services/productCmsService";

// Sync favorites to Supabase
export const syncFavoritesToSupabase = async (
  userId: string,
  favorites: string[],
) => {
  try {
    const { error } = await supabase.from("user_state").upsert(
      {
        user_id: userId,
        favorites,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    );

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(
      "Failed to sync favorites to Supabase:",
      getReadableSupabaseError(error),
      error,
    );
  }
};

// Listen for favorite changes and sync to Supabase
export const setupFavoritesSync = (userId: string | null) => {
  if (!userId) return;

  const handleFavoritesChange = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    syncFavoritesToSupabase(userId, favorites);
  };

  window.addEventListener("favoritesChanged", handleFavoritesChange);

  return () => {
    window.removeEventListener("favoritesChanged", handleFavoritesChange);
  };
};
