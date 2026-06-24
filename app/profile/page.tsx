"use client";

import { useAuth } from "@/lib/auth-context";

const history = [
  { phrase: "Hat Jaa", type: "Meme", time: "2h ago" },
  { phrase: "Kem Cho", type: "Sticker", time: "5h ago" },
  { phrase: "Mood Off", type: "GIF", time: "Yesterday" }
];

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <section>
        <p className="text-slate-600">Loading profile...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sign in to view profile</h1>
        <p className="mt-2 text-slate-600">You need to sign in to access your saved reactions and history.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Your Profile</h1>
        <p className="mt-2 text-slate-600">{user.email}</p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Saved Reactions</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">34</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Downloads</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">112</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Plan</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">Pro</p>
          </article>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-700">Recent History</p>
          <ul className="mt-3 space-y-2">
            {history.map((item) => (
              <li key={item.phrase} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                <span>
                  {item.phrase} • {item.type}
                </span>
                <span className="text-slate-500">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-700">Settings</p>
          <button
            type="button"
            className="mt-3 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </section>
  );
}
