"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

type User = { id: string; email: string } | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  isGoogleAuthAvailable: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const isGoogleAuthAvailable = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true";

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || "" });
        }
      } catch (error) {
        console.error("Auth check failed (Supabase not configured):", error);
      } finally {
        setLoading(false);
      }
    };

    void checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || "" });
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    if (!isGoogleAuthAvailable) {
      throw new Error(
        "Google sign-in is disabled. Set NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true after enabling Google in Supabase Auth > Providers."
      );
    }

    const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true }
    });
    if (error) {
      const lower = error.message.toLowerCase();
      if (lower.includes("provider is not enabled") || lower.includes("unsupported provider")) {
        throw new Error(
          "Google sign-in is not enabled for this project. Enable Google in Supabase Auth > Providers, then add your app URL to Auth > URL Configuration."
        );
      }
      throw error;
    }

    if (!data?.url) {
      throw new Error("Unable to start Google sign-in. Please try again.");
    }

    window.location.assign(data.url);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isGoogleAuthAvailable, signUp, signIn, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
