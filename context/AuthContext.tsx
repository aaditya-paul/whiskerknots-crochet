"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? user.email : "No user");
      setUser(user);

      if (user) {
        try {
          // Fetch user profile from Firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const profileData = userDoc.data() as UserProfile;
            console.log("Profile loaded from Firestore:", profileData);
            setUserProfile(profileData);
          } else {
            // Create profile if it doesn't exist
            console.log("Creating new profile for user:", user.email);
            const profile: UserProfile = {
              uid: user.uid,
              email: user.email || "",
              displayName:
                user.displayName || user.email?.split("@")[0] || "User",
              photoURL: user.photoURL,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, profile);
            // Also update Firebase Auth profile
            await updateProfile(user, { displayName: profile.displayName });
            setUserProfile(profile);
            console.log("New profile created:", profile);
          }
        } catch (error) {
          console.error("Error fetching/creating user profile:", error);
          // Fallback to auth data if Firestore fails
          const fallbackProfile: UserProfile = {
            uid: user.uid,
            email: user.email || "",
            displayName:
              user.displayName || user.email?.split("@")[0] || "User",
            photoURL: user.photoURL,
            createdAt: new Date().toISOString(),
          };
          setUserProfile(fallbackProfile);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    console.log("Starting signup for:", email);
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName });

    // Create user profile in Firestore
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || "",
      displayName,
      photoURL: null,
      createdAt: new Date().toISOString(),
    };

    console.log("Creating profile in Firestore:", profile);
    await setDoc(doc(db, "users", user.uid), profile);
    setUserProfile(profile);
    console.log("Signup complete!");
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const updateUserProfile = async (displayName: string) => {
    if (!user) return;

    await updateProfile(user, { displayName });

    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, { displayName }, { merge: true });

    setUserProfile((prev) => (prev ? { ...prev, displayName } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signup,
        login,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
