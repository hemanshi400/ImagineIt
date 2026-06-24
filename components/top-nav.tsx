"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AuthModal } from "./auth-modal";

const links = [
  { href: "/", label: "Home" },
  { href: "/generate", label: "Create" },
  { href: "/trending", label: "Trending" },
  { href: "/profile", label: "Profile" }
];

export function TopNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/70 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold text-slate-900">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 text-white">
              <Sparkles size={18} aria-hidden="true" />
            </span>
            <span>SaySee</span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden text-sm text-slate-600 md:inline">{user.email}</span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  aria-label="Sign out"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="rounded-lg bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2 text-xs font-semibold text-white hover:brightness-105"
              >
                Sign In
              </button>
            )}
          </div>
        </nav>
      </header>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
