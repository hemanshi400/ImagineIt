"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Sparkles, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { AuthModal } from "@/components/auth-modal";

const steps = [
  "🐵 Understanding Emotion...",
  "🐱 Choosing Character...",
  "🦊 Creating Reaction..."
];

const REACTION_TYPES = ["Sticker", "GIF", "Meme", "Image"];

type SpeechRecognitionType = {
  lang: string;
  start: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionType;

export default function GeneratePage() {
  const { user, loading: authLoading } = useAuth();
  const [phrase, setPhrase] = useState("Hat Jaa");
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [languageBadge, setLanguageBadge] = useState("Gujarati Detected");
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(["Sticker", "GIF", "Meme", "Image"]));
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  const currentStep = useMemo(() => steps[stepIndex], [stepIndex]);

  const detectBadge = (value: string) => {
    const normalized = value.toLowerCase();
    if (normalized.includes("kem") || normalized.includes("cho") || normalized.includes("jalsa")) {
      setLanguageBadge("Gujarati Detected");
      return;
    }
    if (normalized.includes("hat") || normalized.includes("yaa") || normalized.includes("wah")) {
      setLanguageBadge("Hindi Detected");
      return;
    }
    setLanguageBadge("English Detected");
  };

  const toggleType = (type: string) => {
    const updated = new Set(selectedTypes);
    if (updated.has(type)) {
      updated.delete(type);
    } else {
      updated.add(type);
    }
    setSelectedTypes(updated);
  };

  const onGenerate = async () => {
    if (!phrase.trim() || selectedTypes.size === 0) return;

    setLoading(true);
    setStepIndex(0);
    detectBadge(phrase);

    const timer1 = setTimeout(() => setStepIndex(1), 500);
    const timer2 = setTimeout(() => setStepIndex(2), 950);

    await new Promise((resolve) => setTimeout(resolve, 1400));

    clearTimeout(timer1);
    clearTimeout(timer2);

    const q = new URLSearchParams({
      phrase: phrase.trim(),
      types: Array.from(selectedTypes).join(",")
    }).toString();
    router.push(`/results?${q}`);
  };

  const onVoiceInput = () => {
    const ctor = (window as Window & {
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
      SpeechRecognition?: SpeechRecognitionConstructor;
    }).SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!ctor) return;

    const recognition = new ctor();
    recognition.lang = "en-IN";
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setPhrase(transcript);
      detectBadge(transcript);
    };
    recognition.start();
  };

  if (authLoading) {
    return (
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_35px_120px_-45px_rgba(124,58,237,0.6)] backdrop-blur-xl sm:p-8">
        <p className="text-slate-600">Loading...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <>
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_35px_120px_-45px_rgba(124,58,237,0.6)] backdrop-blur-xl sm:p-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-800">
            <Sparkles size={14} /> Generate Reaction
          </p>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Sign in to create reactions</h1>
          <p className="mt-2 text-slate-600">You must be signed in to generate reactions. Join us to start creating!</p>

          <div className="mt-8 rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50 p-8 text-center">
            <LogIn size={48} className="mx-auto mb-4 text-violet-600" />
            <p className="mb-4 text-slate-700">Ready to generate amazing reactions?</p>
            <button
              type="button"
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 px-6 py-3 text-base font-semibold text-white transition hover:brightness-105"
            >
              <LogIn size={18} /> Sign In or Sign Up
            </button>
          </div>
        </section>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  };

  return (
    <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_35px_120px_-45px_rgba(124,58,237,0.6)] backdrop-blur-xl sm:p-8">
      <p className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-violet-800">
        <Sparkles size={14} /> Generate Reaction
      </p>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Say it naturally. Let AI do the rest.</h1>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <label htmlFor="generate-input" className="text-sm font-semibold text-slate-700">
          Expression
        </label>
        <textarea
          id="generate-input"
          value={phrase}
          onChange={(e) => {
            setPhrase(e.target.value);
            detectBadge(e.target.value);
          }}
          rows={3}
          placeholder="Hat Jaa"
          className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none transition focus:border-violet-400"
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{languageBadge}</span>
          <button
            type="button"
            onClick={onVoiceInput}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
            aria-label="Use voice input"
          >
            <Mic size={14} /> Voice Input
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <label className="text-sm font-semibold text-slate-700">Which reactions do you want?</label>
        <div className="mt-3 flex flex-wrap gap-2">
          {REACTION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition ${
                selectedTypes.has(type)
                  ? "border-violet-500 bg-violet-100 text-violet-800"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">Select the types you want to generate (saves API credits)</p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onGenerate}
          disabled={loading || selectedTypes.size === 0}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 px-6 text-sm font-semibold text-white transition hover:brightness-105 disabled:opacity-60"
        >
          ✨ Generate Reaction
        </button>
      </div>

      <div className="mt-6 min-h-16 rounded-2xl border border-dashed border-violet-200 bg-violet-50/70 p-4">
        <p className="text-sm font-medium text-violet-800">{loading ? currentStep : "Ready to think with AI magic..."}</p>
      </div>
    </section>
  );
}
