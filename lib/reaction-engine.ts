export type SupportedLanguage = "English" | "Hindi" | "Gujarati";

export type Emotion =
  | "Happy"
  | "Sad"
  | "Funny"
  | "Angry"
  | "Excited"
  | "Greeting"
  | "Motivational"
  | "Celebration"
  | "Confused"
  | "Sarcastic"
  | "Surprised";

export type Intent =
  | "Greeting"
  | "Dismissal"
  | "Celebration"
  | "Sympathy"
  | "Motivation"
  | "Sarcasm"
  | "Excitement"
  | "Humor"
  | "Attitude";

export type ReactionKind = "Sticker" | "GIF" | "Meme" | "Image";

export type ReactionItem = {
  kind: ReactionKind;
  title: string;
  caption: string;
  character: string;
  artStyle: string;
  emoji: string;
  gradient: string;
  mediaUrl?: string;
  downloadUrl?: string;
  mimeType?: string;
  publicId?: string;
  isGenerated?: boolean;
};

export type Analysis = {
  text: string;
  language: SupportedLanguage;
  emotion: Emotion;
  intent: Intent;
  tone: string;
};

export type GenerationResult = {
  analysis: Analysis;
  outputs: ReactionItem[];
};

const LANGUAGE_MARKERS = {
  Gujarati: ["kem", "cho", "jalsa", "che", "majama"],
  Hindi: ["arey", "arre", "hat", "jaa", "yaar", "wah", "kya"]
} as const;

const CHARACTER_MAP: Record<Emotion | "default", string[]> = {
  Happy: ["Dog", "Panda", "Rabbit"],
  Sad: ["Teddy Bear", "Panda", "Coffee Cup"],
  Funny: ["Monkey", "Cat", "Comic Mascot"],
  Angry: ["Tiger", "Cat", "Lion"],
  Excited: ["Dog", "Monkey", "Fox"],
  Greeting: ["Dog", "Panda", "Friendly Avatar"],
  Motivational: ["Lion", "Fox", "Hero Avatar"],
  Celebration: ["Lion", "Monkey", "Festival Mascot"],
  Confused: ["Cat", "Panda", "Emoji Character"],
  Sarcastic: ["Cat", "Fox", "Meme Face"],
  Surprised: ["Rabbit", "Dog", "Comic Mascot"],
  default: ["Panda", "Monkey", "Cat"]
};

const STYLE_MAP: Record<ReactionKind, string[]> = {
  Sticker: ["Cartoon", "Cute", "Minimal"],
  GIF: ["3D", "Comic", "Social Media Style"],
  Meme: ["Meme", "Comic", "Pixel Art"],
  Image: ["Anime", "Cartoon", "Minimal"]
};

const GRADIENTS = [
  "from-fuchsia-500 via-violet-500 to-pink-500",
  "from-amber-400 via-orange-500 to-rose-500",
  "from-cyan-400 via-blue-500 to-indigo-500",
  "from-lime-400 via-emerald-500 to-teal-500"
];

function pickOne<T>(items: T[], seed: number): T {
  return items[seed % items.length];
}

function stableSeed(text: string): number {
  return text.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

export function detectLanguage(text: string): SupportedLanguage {
  const normalized = text.toLowerCase();
  const guj = LANGUAGE_MARKERS.Gujarati.some((part) => normalized.includes(part));
  if (guj) {
    return "Gujarati";
  }

  const hin = LANGUAGE_MARKERS.Hindi.some((part) => normalized.includes(part));
  if (hin) {
    return "Hindi";
  }

  return "English";
}

export function detectEmotion(text: string): Emotion {
  const t = text.toLowerCase();
  if (t.includes("mood off") || t.includes("sad") || t.includes("down")) return "Sad";
  if (t.includes("hat jaa") || t.includes("shoo") || t.includes("funny")) return "Funny";
  if (t.includes("kem cho") || t.includes("hello") || t.includes("hi")) return "Greeting";
  if (t.includes("jalsa") || t.includes("party") || t.includes("wow")) return "Celebration";
  if (t.includes("angry") || t.includes("mad")) return "Angry";
  if (t.includes("confuse") || t.includes("what")) return "Confused";
  return "Excited";
}

export function detectIntent(text: string): Intent {
  const t = text.toLowerCase();
  if (t.includes("hat jaa") || t.includes("go away")) return "Dismissal";
  if (t.includes("kem cho") || t.includes("hello") || t.includes("hi")) return "Greeting";
  if (t.includes("jalsa") || t.includes("party") || t.includes("congrats")) return "Celebration";
  if (t.includes("mood off") || t.includes("sad")) return "Sympathy";
  if (t.includes("win") || t.includes("lets go")) return "Excitement";
  return "Humor";
}

function pickEmoji(kind: ReactionKind, emotion: Emotion): string {
  if (kind === "Sticker") return emotion === "Sad" ? "🥹" : "🎭";
  if (kind === "GIF") return emotion === "Celebration" ? "🎉" : "🎞️";
  if (kind === "Meme") return emotion === "Funny" ? "😂" : "😎";
  return emotion === "Greeting" ? "👋" : "🖼️";
}

export function generateReactions(text: string): GenerationResult {
  const seed = stableSeed(text.trim() || "saysee");
  const language = detectLanguage(text);
  const emotion = detectEmotion(text);
  const intent = detectIntent(text);
  const tone = language === "Gujarati" ? "Warm" : language === "Hindi" ? "Casual" : "Playful";

  const characterPool = CHARACTER_MAP[emotion] ?? CHARACTER_MAP.default;

  const outputs: ReactionItem[] = ["Sticker", "GIF", "Meme", "Image"].map((kind, i) => {
    const typedKind = kind as ReactionKind;
    const character = pickOne(characterPool, seed + i * 13);
    const artStyle = pickOne(STYLE_MAP[typedKind], seed + i * 17);

    return {
      kind: typedKind,
      title: `${typedKind} Ready`,
      caption: `${character} reacting in ${artStyle.toLowerCase()} style`,
      character,
      artStyle,
      emoji: pickEmoji(typedKind, emotion),
      gradient: GRADIENTS[i % GRADIENTS.length]
    };
  });

  return {
    analysis: {
      text,
      language,
      emotion,
      intent,
      tone
    },
    outputs
  };
}
