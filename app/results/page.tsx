import { ReactionCard } from "@/components/reaction-card";
import { generateReactionPack } from "@/lib/generation-service";
import { cache } from "react";

// Sora video generation polls for a few minutes; allow a long render window.
export const maxDuration = 300;

type PageProps = {
  searchParams: Promise<{ phrase?: string; types?: string }>;
};

const getReactionPack = cache(async (phrase: string, selectedTypes: string[]) =>
  generateReactionPack(phrase, selectedTypes)
);

export default async function ResultsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const phrase = params.phrase?.trim() || "Hat Jaa";
  const typesParam = params.types || "Sticker,GIF,Meme,Image";
  const selectedTypes = typesParam.split(",").filter((t) => t.trim());
  const data = await getReactionPack(phrase, selectedTypes);

  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Your Reaction Pack</h1>
      <p className="mt-2 text-slate-600">Generated for: “{phrase}”</p>

      <div className="mt-6 rounded-2xl border border-white/80 bg-white/80 p-4 text-sm shadow-sm backdrop-blur sm:p-5">
        <p className="font-semibold text-slate-800">AI Analysis</p>
        <p className="mt-1 text-slate-600">
          {data.analysis.language} • {data.analysis.emotion} • {data.analysis.intent} • {data.analysis.tone}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          {data.outputs.some((item) => item.mediaUrl)
            ? "Generated media is ready to preview, share, and download."
            : "No real media was generated. Check OPENAI_API_KEY and Cloudinary settings if you expect image outputs."}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.outputs.map((item) => (
          <ReactionCard key={item.kind} item={item} />
        ))}
      </div>
    </section>
  );
}
