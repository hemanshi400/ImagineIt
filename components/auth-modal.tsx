"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { X } from "lucide-react";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signUp, signIn, signInWithGoogle, isGoogleAuthAvailable } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        await signUp(email, password);
        onClose();
      } else {
        await signIn(email, password);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur">
      <div className="relative w-full max-w-md rounded-2xl border border-white/80 bg-white/95 p-6 shadow-lg">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-slate-900">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h2>

        {!isSignUp && (
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || !isGoogleAuthAvailable}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
            >
              <span
                aria-hidden="true"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-bold"
              >
                G
              </span>
              Continue with Google
            </button>
            {!isGoogleAuthAvailable && (
              <p className="text-xs text-amber-700">
                Google sign-in is currently disabled for this app.
              </p>
            )}
            <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              <span>or</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-violet-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-violet-400"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-60"
          >
            {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="ml-1 font-semibold text-violet-600 hover:underline"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}
