"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { dbAuth, dbProfiles, dbUserState } from "../lib/db";

const AUTH_INIT_TIMEOUT_MS = 12_000;

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

  const loadProfile = async (
    authUser: AuthUser,
    options?: { createIfMissing?: boolean },
  ): Promise<boolean> => {
    const createIfMissing = options?.createIfMissing ?? false;

    const profileData = await dbProfiles.fetchByUserId(authUser.uid);

    if (profileData) {
      const profile: UserProfile = {
        uid: profileData.id,
        email: profileData.email || authUser.email || "",
        displayName: profileData.display_name,
        photoURL: profileData.photo_url,
        createdAt: profileData.created_at || new Date().toISOString(),
      };

      setUserProfile(profile);
      return true;
    }

    if (!createIfMissing) {
      setUserProfile(null);
      return false;
    }

    const profileToCreate: UserProfile = {
      uid: authUser.uid,
      email: authUser.email || "",
      displayName:
        authUser.displayName || authUser.email?.split("@")[0] || "User",
      photoURL: authUser.photoURL,
      createdAt: new Date().toISOString(),
    };

    await dbProfiles.upsert({
      id: profileToCreate.uid,
      email: profileToCreate.email,
      displayName: profileToCreate.displayName,
      photoUrl: profileToCreate.photoURL,
      createdAt: profileToCreate.createdAt,
    });

    // Also create initial user_state row so CartContext can sync without RLS issues
    try {
      await dbUserState.ensureEmptyRow(profileToCreate.uid);
    } catch (userStateError) {
      console.warn("Failed to create initial user_state row:", userStateError);
      // Don't throw - profile was created successfully, user_state creation can happen later
    }

    setUserProfile(profileToCreate);
    return true;
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

    // Safety-net: if auth init takes too long, stop showing the loading state.
    // This does NOT abort the underlying getSession() — GoTrue's internal state
    // machine continues running to completion so the singleton client stays healthy.
    const loadingWatchdog = setTimeout(() => {
      if (!mounted) return;
      console.warn("Auth initialization is taking longer than expected.");
      setLoading(false);
    }, AUTH_INIT_TIMEOUT_MS);

    const signOutUnavailableBackendAccount = async () => {
      try {
        await dbAuth.signOut();
      } catch (error) {
        console.error("Failed to sign out unavailable backend account:", error);
      }

      if (!mounted) return;
      setUser(null);
      setUserProfile(null);
    };

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await dbAuth.getSession();

        if (!mounted) return;

        if (session?.user) {
          const mappedUser = mapSupabaseUser(session.user);
          setUser(mappedUser);

          try {
            const existsInBackend = await loadProfile(mappedUser, {
              createIfMissing: false,
            });

            if (!existsInBackend) {
              console.warn(
                "Signed out: authenticated user missing in backend profiles.",
              );
              await signOutUnavailableBackendAccount();
            }
          } catch (error) {
            console.error("Error loading backend profile:", error);
            await signOutUnavailableBackendAccount();
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        if (!mounted) return;
        setUser(null);
        setUserProfile(null);
      } finally {
        if (mounted) {
          clearTimeout(loadingWatchdog);
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const handleAuthStateChange = async (
      event: string,
      session: Awaited<ReturnType<typeof dbAuth.getSession>>["data"]["session"],
    ) => {
      if (!mounted) return;

      if (session?.user) {
        const mappedUser = mapSupabaseUser(session.user);
        setUser(mappedUser);

        try {
          // Allow profile creation on signup/signin events (use string comparison)
          const eventString = String(event);
          const isNewSession =
            eventString.includes("SIGNED_UP") ||
            eventString.includes("SIGNED_IN");
          const existsInBackend = await loadProfile(mappedUser, {
            createIfMissing: isNewSession,
          });

          if (!existsInBackend && !isNewSession) {
            console.warn(
              "Signed out: authenticated user missing in backend profiles.",
            );
            await dbAuth.signOut();
            if (!mounted) return;
            setUser(null);
            setUserProfile(null);
          }
        } catch (error) {
          console.error("Error loading backend profile:", error);
          await dbAuth.signOut();
          if (!mounted) return;
          setUser(null);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }

      if (mounted) setLoading(false);
    };

    const {
      data: { subscription },
    } = dbAuth.onAuthStateChange((event, session) => {
      // Supabase recommends keeping this callback fast and deferring async work.
      setTimeout(() => {
        void handleAuthStateChange(String(event), session);
      }, 0);
      return Promise.resolve();
    });

    return () => {
      mounted = false;
      clearTimeout(loadingWatchdog);
      subscription.unsubscribe();
    };
  }, []);

  const signup = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    const { error: signupError } = await dbAuth.signUp(
      email,
      password,
      displayName,
    );

    if (signupError) {
      throw signupError;
    }

    // Profile creation is now handled by onAuthStateChange when SIGNED_UP event fires
  };

  const login = async (email: string, password: string) => {
    const { error } = await dbAuth.signInWithPassword(email, password);

    if (error) {
      throw error;
    }
  };

  const logout = async () => {
    const { error } = await dbAuth.signOut();
    if (error) {
      throw error;
    }

    setUser(null);
    setUserProfile(null);
  };

  const updateUserProfile = async (displayName: string) => {
    if (!user) return;

    const { error: authError } =
      await dbAuth.updateUserDisplayName(displayName);

    if (authError) {
      throw authError;
    }

    await dbProfiles.upsert({
      id: user.uid,
      email: user.email || "",
      displayName,
      photoUrl: user.photoURL,
      createdAt: userProfile?.createdAt || new Date().toISOString(),
    });

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
