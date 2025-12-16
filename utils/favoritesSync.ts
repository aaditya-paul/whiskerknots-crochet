import { doc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

// Sync favorites to Firebase
export const syncFavoritesToFirebase = async (
  userId: string,
  favorites: string[]
) => {
  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, { favorites }, { merge: true });
  } catch (error) {
    console.error("Failed to sync favorites to Firebase:", error);
  }
};

// Listen for favorite changes and sync to Firebase
export const setupFavoritesSync = (userId: string | null) => {
  if (!userId) return;

  const handleFavoritesChange = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    syncFavoritesToFirebase(userId, favorites);
  };

  window.addEventListener("favoritesChanged", handleFavoritesChange);

  return () => {
    window.removeEventListener("favoritesChanged", handleFavoritesChange);
  };
};
