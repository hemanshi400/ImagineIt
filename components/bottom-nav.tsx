"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Home, Sparkles, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/generate", label: "Create", icon: Sparkles },
  { href: "/trending", label: "Trending", icon: Flame },
  { href: "/profile", label: "Profile", icon: UserRound }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition",
                  isActive ? "text-violet-700" : "text-slate-500"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
