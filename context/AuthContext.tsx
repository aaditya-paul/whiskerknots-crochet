"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signup: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrCreateProfile = async (authUser: AuthUser) => {
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id,email,display_name,photo_url,created_at")
      .eq("id", authUser.uid)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      throw profileError;
    }

    if (profileData) {
      const profile: UserProfile = {
        uid: profileData.id,
        email: profileData.email || authUser.email || "",
        displayName: profileData.display_name,
        photoURL: profileData.photo_url,
        createdAt: profileData.created_at || new Date().toISOString(),
      };

      setUserProfile(profile);
      return;
    }

    const profileToCreate: UserProfile = {
      uid: authUser.uid,
      email: authUser.email || "",
      displayName:
        authUser.displayName || authUser.email?.split("@")[0] || "User",
      photoURL: authUser.photoURL,
      createdAt: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase.from("profiles").upsert({
      id: profileToCreate.uid,
      email: profileToCreate.email,
      display_name: profileToCreate.displayName,
      photo_url: profileToCreate.photoURL,
      created_at: profileToCreate.createdAt,
    });

    if (upsertError) {
      throw upsertError;
    }

    setUserProfile(profileToCreate);
  };

  const mapSupabaseUser = (source: {
    id: string;
    email?: string | null;
    user_metadata?: { full_name?: string; avatar_url?: string };
  }): AuthUser => {
    return {
      uid: source.id,
      email: source.email || null,
      displayName: source.user_metadata?.full_name || null,
      photoURL: source.user_metadata?.avatar_url || null,
    };
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user) {
        const mappedUser = mapSupabaseUser(session.user);
        setUser(mappedUser);

        try {
          await loadOrCreateProfile(mappedUser);
        } catch (error) {
          console.error("Error fetching/creating user profile:", error);
          setUserProfile({
            uid: mappedUser.uid,
            email: mappedUser.email || "",
            displayName:
              mappedUser.displayName ||
              mappedUser.email?.split("@")[0] ||
              "User",
            photoURL: mappedUser.photoURL,
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }

      setLoading(false);
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        const mappedUser = mapSupabaseUser(session.user);
        setUser(mappedUser);

        try {
          await loadOrCreateProfile(mappedUser);
        } catch (error) {
          console.error("Error fetching/creating user profile:", error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signup = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName,
        },
      },
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      const mappedUser = mapSupabaseUser(data.user);
      setUser(mappedUser);
      await loadOrCreateProfile({
        ...mappedUser,
        displayName: displayName || mappedUser.displayName,
      });
    }
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }

    setUser(null);
    setUserProfile(null);
  };

  const updateUserProfile = async (displayName: string) => {
    if (!user) return;

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: displayName,
      },
    });

    if (authError) {
      throw authError;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: user.uid,
      email: user.email || "",
      display_name: displayName,
      photo_url: user.photoURL,
      created_at: userProfile?.createdAt || new Date().toISOString(),
    });

    if (profileError) {
      throw profileError;
    }

    setUserProfile((prev) => (prev ? { ...prev, displayName } : null));
    setUser((prev) => (prev ? { ...prev, displayName } : null));
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
