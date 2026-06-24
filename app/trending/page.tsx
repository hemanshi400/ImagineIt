import Link from "next/link";

const items = ["Hat Jaa", "Kem Cho", "Mood Off", "Jalsa Che", "Aree Waah", "Scene On"];

export default function TrendingPage() {
  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Trending Phrases</h1>
      <p className="mt-2 text-slate-600">Explore what people are turning into reactions right now.</p>

      <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((phrase) => (
          <li key={phrase}>
            <Link
              href={`/results?phrase=${encodeURIComponent(phrase)}`}
              className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 py-4 text-slate-800 shadow-sm backdrop-blur transition hover:-translate-y-0.5"
            >
              <span className="text-lg">🔥 {phrase}</span>
              <span className="text-sm text-slate-500">Generate</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
