"use client";

import { Download, RefreshCw, Share2 } from "lucide-react";
import type { ReactionItem } from "@/lib/reaction-engine";

type Props = {
  item: ReactionItem;
};

async function downloadReaction(item: ReactionItem) {
  if (!item.downloadUrl) {
    return;
  }

  const response = await fetch(item.downloadUrl);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  const extension = item.mimeType === "image/gif" ? "gif" : "png";
  anchor.download = `saysee-${item.kind.toLowerCase()}.${extension}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function shareReaction(item: ReactionItem) {
  const text = `${item.kind}: ${item.caption}`;
  
  // Only use navigator.share if we have a valid HTTP(S) URL (not data URI)
  if (navigator.share && item.mediaUrl && item.mediaUrl.startsWith("http")) {
    void navigator.share({ title: "SaySee Reaction", text, url: item.mediaUrl });
    return;
  }
  
  // Fallback: copy text to clipboard
  void navigator.clipboard.writeText(item.mediaUrl ?? text);
}

export function ReactionCard({ item }: Props) {
  return (
    <article className="group rounded-3xl border border-white/60 bg-white/70 p-4 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.5)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_25px_70px_-30px_rgba(15,23,42,0.65)] sm:p-5">
      <header className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.kind}</p>
          <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
        </div>
        <span className="text-2xl" aria-hidden="true">
          {item.emoji}
        </span>
      </header>

      {item.mediaUrl ? (
        <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.mediaUrl}
            alt={`${item.kind} preview for ${item.caption}`}
            className="h-48 w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className={`mb-4 rounded-2xl bg-gradient-to-br ${item.gradient} p-5 text-white`}>
          <p className="text-sm opacity-85">Character</p>
          <p className="text-xl font-semibold">{item.character}</p>
          <p className="mt-1 text-sm opacity-90">{item.artStyle}</p>
        </div>
      )}

      <div className="mb-4 rounded-2xl bg-slate-50 p-4 text-slate-700">
        <p className="text-sm font-medium">{item.character}</p>
        <p className="mt-1 text-sm text-slate-500">{item.artStyle}</p>
      </div>

      <p className="mb-4 text-sm text-slate-600">{item.caption}</p>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => void downloadReaction(item)}
          disabled={!item.downloadUrl}
          className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
          aria-label={`Download ${item.kind}`}
        >
          <Download size={14} /> Download
        </button>
        <button
          type="button"
          onClick={() => shareReaction(item)}
          disabled={!item.mediaUrl}
          className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
          aria-label={`Share ${item.kind}`}
        >
          <Share2 size={14} /> Share
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
          aria-label={`Regenerate ${item.kind}`}
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    </article>
  );
}
