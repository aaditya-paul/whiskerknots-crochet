"use client";

import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { setupFavoritesSync } from "../utils/favoritesSync";

export default function FavoritesSyncProvider() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const cleanup = setupFavoritesSync(user.uid);
      return cleanup;
    }
  }, [user]);

  return null;
}
