import Link from "next/link";
import { ArrowRight, Mic, Sparkles, Wand2 } from "lucide-react";

const examples = ["Hat Jaa", "Kem Cho", "Jalsa Che", "Mood Off"];

const plans = [
  { name: "Free", price: "₹0", detail: "Limited daily generations" },
  {
    name: "Pro",
    price: "₹99/month",
    detail: "Unlimited generations, HD exports, faster generation"
  },
  {
    name: "Creator",
    price: "₹299/month",
    detail: "Commercial usage, bulk generation, API access"
  }
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_40px_120px_-40px_rgba(124,58,237,0.45)] backdrop-blur-xl sm:p-10">
        <div className="pointer-events-none absolute -top-16 right-0 h-44 w-44 rounded-full bg-fuchsia-400/35 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-8 h-52 w-52 rounded-full bg-violet-500/20 blur-3xl" />

        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-800">
          <Sparkles size={14} /> Say It. See It. Share It.
        </p>

        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
          Turn Words Into Reactions.
        </h1>
        <p className="mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
          Say anything in English, Hindi, or Gujarati and instantly get stickers, GIFs, memes, and reaction images.
        </p>

        <div className="mt-6 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm sm:p-5">
          <label htmlFor="hero-input" className="mb-2 block text-sm font-semibold text-slate-700">
            Try an expression
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="hero-input"
              type="text"
              placeholder="Hat Jaa"
              className="h-12 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base outline-none transition focus:border-violet-400"
              aria-label="Expression input"
            />
            <Link
              href="/generate"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 px-6 text-sm font-semibold text-white transition hover:brightness-105"
            >
              ✨ Generate Reaction <ArrowRight size={15} />
            </Link>
          </div>

          <ul className="mt-4 flex flex-wrap gap-2">
            {examples.map((item) => (
              <li key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-800">Voice Input</p>
            <p className="mt-1 text-sm text-slate-600">Tap the mic and speak naturally.</p>
            <Mic size={18} className="mt-3 text-violet-700" />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-800">Smart AI Pipeline</p>
            <p className="mt-1 text-sm text-slate-600">Language → Emotion → Intent → Character → Style</p>
            <Wand2 size={18} className="mt-3 text-pink-600" />
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.name} className="rounded-2xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur">
            <p className="text-sm font-semibold text-slate-700">{plan.name}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{plan.price}</p>
            <p className="mt-2 text-sm text-slate-600">{plan.detail}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
