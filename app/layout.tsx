import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { BottomNav } from "@/components/bottom-nav";
import { TopNav } from "@/components/top-nav";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta"
});

export const metadata: Metadata = {
  title: "SaySee | Say It. See It. Share It.",
  description:
    "Transform everyday words into stickers, GIFs, memes, and images with multilingual emotion-aware AI."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jakarta.variable} bg-slate-50 text-slate-900 antialiased`}>
        <AuthProvider>
          <TopNav />
          <main className="mx-auto min-h-[calc(100vh-5rem)] w-full max-w-7xl px-4 pb-24 pt-8 md:px-8 md:pb-10">
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
