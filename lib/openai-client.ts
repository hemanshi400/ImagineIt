import OpenAI from "openai";

const openaiKey = process.env.OPENAI_API_KEY;

export const openai = new OpenAI({
  apiKey: openaiKey
});

let resolvedImageModel: string | null | undefined;

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
