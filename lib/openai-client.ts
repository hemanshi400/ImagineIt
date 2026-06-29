import OpenAI from "openai";

const openaiKey = process.env.OPENAI_API_KEY;
const soraModel = process.env.SORA_MODEL || "sora-2";

export const openai = new OpenAI({
  apiKey: openaiKey
});

let resolvedImageModel: string | null | undefined;
// undefined = not yet tried, null = account has no Sora access (stop trying)
let videoAccessOk: boolean | undefined;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The award-winning-animation-director system prompt: turns any phrase
// (English/Hindi/Gujarati/Hinglish) into a cinematic text-to-video spec.
const GIF_PROMPT_SYSTEM = `You are an award-winning animation director.

Your job is NOT to answer the user's phrase.

Your ONLY job is to convert any user phrase into a cinematic animation prompt for a text-to-video AI.

The user may write in:

* English
* Hindi
* Gujarati
* Hinglish

First understand the meaning.

Then create a detailed animation prompt.

Never translate the visible text.

Always preserve the original phrase exactly.

The animation must communicate the emotion visually.

Generate an original scene.

Never reference copyrighted movies, TV shows, celebrities or existing GIFs.

The animation should feel expressive and internet meme worthy.

Output ONLY the following JSON.

{
"title": "",
"emotion": "",
"animation_style": "",
"scene": "",
"character": "",
"facial_expression": "",
"body_language": "",
"camera": "",
"lighting": "",
"background": "",
"motion": "",
"secondary_motion": "",
"loop": "",
"duration": "3 seconds",
"text_overlay": "",
"color_palette": "",
"negative_prompt": ""
}

Rules

Scene should be short.

Camera should be dynamic.

Characters should exaggerate emotions.

Background should never overpower the subject.

Animation must naturally loop.

Text overlay must equal the user's original phrase exactly.

Negative prompt should prevent:

* blurry
* watermark
* logo
* extra limbs
* low quality
* bad anatomy
* cropped
* flickering
* duplicate people
* distorted face
* text errors
* poor animation
* camera shake
* frame glitches
* artifacts

it is for GIF Generation`;

export type AnimationSpec = {
  title?: string;
  emotion?: string;
  animation_style?: string;
  scene?: string;
  character?: string;
  facial_expression?: string;
  body_language?: string;
  camera?: string;
  lighting?: string;
  background?: string;
  motion?: string;
  secondary_motion?: string;
  loop?: string;
  duration?: string;
  text_overlay?: string;
  color_palette?: string;
  negative_prompt?: string;
};

export function hasOpenAIKey() {
  return Boolean(openaiKey && openaiKey.startsWith("sk-"));
}

export async function generateImageWithDALLE(prompt: string): Promise<string> {
  if (resolvedImageModel === null) {
    return "";
  }

  const imageModels = resolvedImageModel 
    ? [resolvedImageModel] 
    : ["gpt-image-1", "gpt-image-1-mini", "gpt-image-1.5", "gpt-image-2", "gpt-image-2-2026-04-21"];

  for (const model of imageModels) {
    try {
      const response = await openai.images.generate({
        model,
        prompt,
        n: 1,
        size: "1024x1024"
      });

      const imageUrl = response.data?.[0]?.url;
      if (imageUrl) {
        console.log(`✓ Image generated with ${model}`);
        resolvedImageModel = model;
        return imageUrl;
      }

      // gpt-image models may return base64 bytes instead of a hosted URL.
      const base64Image = response.data?.[0]?.b64_json;
      if (base64Image) {
        console.log(`✓ Image generated with ${model} (base64)`);
        resolvedImageModel = model;
        return `data:image/png;base64,${base64Image}`;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const lower = message.toLowerCase();

      console.log(`✗ Model ${model}: ${message.substring(0, 60)}`);

      // Model unavailable for this account: try the next candidate.
      if (lower.includes("does not exist") || lower.includes("not found") || lower.includes("invalid_value")) {
        continue;
      }

      // Quota or auth issue means retrying more models won't help for now.
      if (lower.includes("rate limit") || lower.includes("quota") || lower.includes("unauthorized") || lower.includes("api key")) {
        resolvedImageModel = null;
        return "";
      }

      continue;
    }
  }

  console.warn("⚠ No image model succeeded");
  resolvedImageModel = null;
  return "";
}

// Convert a phrase into a structured cinematic animation spec via GPT.
export async function generateAnimationSpec(phrase: string): Promise<AnimationSpec | null> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: GIF_PROMPT_SYSTEM },
        { role: "user", content: phrase }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || "{}";
    const spec = JSON.parse(content) as AnimationSpec;
    // The text overlay must always be the user's exact phrase, never a model paraphrase.
    spec.text_overlay = phrase;
    return spec;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("⚠ Animation spec generation failed:", message.substring(0, 80));
    return null;
  }
}

// Flatten the structured spec into a single descriptive prompt for Sora.
export function buildSoraPrompt(spec: AnimationSpec, phrase: string): string {
  const parts = [
    spec.scene,
    spec.character && `Character: ${spec.character}.`,
    spec.facial_expression && `Facial expression: ${spec.facial_expression}.`,
    spec.body_language && `Body language: ${spec.body_language}.`,
    spec.animation_style && `Animation style: ${spec.animation_style}.`,
    spec.camera && `Camera: ${spec.camera}.`,
    spec.lighting && `Lighting: ${spec.lighting}.`,
    spec.background && `Background: ${spec.background}.`,
    spec.motion && `Primary motion: ${spec.motion}.`,
    spec.secondary_motion && `Secondary motion: ${spec.secondary_motion}.`,
    spec.color_palette && `Color palette: ${spec.color_palette}.`,
    spec.loop && `Loop: ${spec.loop}.`,
    `Display the exact on-screen text, unchanged and correctly spelled: "${phrase}".`,
    spec.negative_prompt && `Avoid: ${spec.negative_prompt}.`
  ].filter(Boolean);

  return parts.join(" ");
}

// Generate an actual animated clip with Sora. Returns the raw MP4 bytes,
// or null if the account lacks video access or generation fails.
export async function generateVideoWithSora(
  prompt: string
): Promise<{ bytes: Buffer; mimeType: string } | null> {
  if (videoAccessOk === false) {
    return null;
  }

  try {
    let video = await openai.videos.create({
      model: soraModel,
      prompt,
      seconds: "4", // Sora's minimum; the 3s spec rounds up.
      size: "720x1280" // portrait, social/meme friendly
    });

    videoAccessOk = true;
    console.log(`▶ Sora job ${video.id} created (${soraModel})`);

    // Poll until the render finishes (Sora jobs can take a few minutes).
    const maxAttempts = 60;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (video.status === "completed") {
        break;
      }
      if (video.status === "failed") {
        console.warn(`✗ Sora job ${video.id} failed:`, video.error?.message ?? "unknown error");
        return null;
      }

      await sleep(5000);
      video = await openai.videos.retrieve(video.id);
      console.log(`… Sora ${video.id}: ${video.status} (${video.progress}%)`);
    }

    if (video.status !== "completed") {
      console.warn(`✗ Sora job ${video.id} did not complete in time (status: ${video.status})`);
      return null;
    }

    const content = await openai.videos.downloadContent(video.id, { variant: "video" });
    const arrayBuffer = await content.arrayBuffer();
    console.log(`✓ Sora video downloaded (${arrayBuffer.byteLength} bytes)`);
    return { bytes: Buffer.from(arrayBuffer), mimeType: "video/mp4" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const lower = message.toLowerCase();

    // Account can't use Sora (no access / unverified / model missing): stop trying.
    if (
      lower.includes("does not exist") ||
      lower.includes("not found") ||
      lower.includes("unauthorized") ||
      lower.includes("must be verified") ||
      lower.includes("access") ||
      lower.includes("permission")
    ) {
      console.warn("⚠ Sora video unavailable for this account, falling back to still image:", message.substring(0, 100));
      videoAccessOk = false;
      return null;
    }

    console.warn("⚠ Sora video generation failed:", message.substring(0, 100));
    return null;
  }
}

export async function analyzeWithGPT(text: string): Promise<{
  emotion: string;
  intent: string;
  character: string;
  style: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            'You are a reaction emotion analyzer. Respond with JSON: { "emotion": "...", "intent": "...", "character": "...", "style": "..." }'
        },
        {
          role: "user",
          content: `Analyze this expression and suggest a reaction: "${text}"`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || "{}";
    return JSON.parse(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const lower = message.toLowerCase();

    // 429 = quota exceeded, 401 = auth, log silently and use fallback
    if (lower.includes("429") || lower.includes("quota")) {
      console.log("ℹ GPT analysis skipped (quota reached), using fallback");
      return { emotion: "Happy", intent: "Greeting", character: "Panda", style: "Cute" };
    }

    console.warn("⚠ GPT analysis failed:", message.substring(0, 80));
    return { emotion: "Happy", intent: "Greeting", character: "Panda", style: "Cute" };
  }
}
