import {
  uploadRemoteAssetToCloudinary,
  uploadVideoBufferToCloudinary,
  buildCloudinaryDeliveryUrl,
  buildCloudinaryVideoGifUrl,
  hasCloudinaryConfig
} from "@/lib/cloudinary-client";
import {
  type AnimationContext,
  type PhraseAnalysis,
  analyzeWithGPT,
  buildSoraPrompt,
  generateAnimationSpec,
  generateImageWithDALLE,
  generateVideoWithSora,
  hasOpenAIKey
} from "@/lib/openai-client";
import {
  type Analysis,
  type GenerationResult,
  type ReactionItem,
  generateReactions
} from "@/lib/reaction-engine";

function normalizeAnalysis(base: Analysis, ai: PhraseAnalysis): Analysis {
  return {
    ...base,
    language: ai.language,
    emotion: ai.emotion as Analysis["emotion"],
    intent: ai.intent as Analysis["intent"],
    tone: ai.style
  };
}

function buildVisualPrompt(phrase: string, analysis: Analysis, item: ReactionItem) {
  const baseContext = `Generate a reaction visual inspired by the phrase: "${phrase}"`;

  if (item.kind === "Sticker") {
    return [
      `${baseContext}`,
      `Style: ${item.artStyle} sticker design`,
      `Character: ${item.character}`,
      `Emotion conveyed: ${analysis.emotion}`,
      `Make it: bold, expressive, emoji-like reaction sticker`,
      `Colors: vibrant and eye-catching with strong contrast`,
      `Composition: centered subject on transparent/white background`,
      `Quality: high-resolution, clean lines, ready for social media sharing`
    ].join(". ");
  }

  if (item.kind === "Meme") {
    return [
      `${baseContext} - Create a witty, relatable meme`,
      `Meme text/caption: "${phrase}"`,
      `Humor style: ${analysis.tone}, ${analysis.intent}`,
      `Character/subject: ${item.character} as the focal point`,
      `Art style: ${item.artStyle} with bold typography`,
      `Layout: Top or bottom text placement with meme-style impact`,
      `Make it shareable: funny, memetic, instantly recognizable format`,
      `Include humorous exaggeration or relatable reaction that matches the phrase`
    ].join(". ");
  }

  if (item.kind === "GIF") {
    return [
      `${baseContext} - Create a dynamic animated reaction-ready frame`,
      `Character: ${item.character} in an expressive, looping-ready pose`,
      `Motion suggestion: Suggest movement - jumping, bouncing, gesturing, or spinning`,
      `Emotion: ${analysis.emotion} with exaggerated, animated energy`,
      `Art style: ${item.artStyle} with vivid colors and sharp details`,
      `Composition: Dynamic action pose that works well in a loop`,
      `Quality: High-energy, frame-ready for GIF animation`,
      `Include motion trails, speed lines, or action elements to suggest movement`
    ].join(". ");
  }

  if (item.kind === "Image") {
    return [
      `${baseContext} - Create a premium, polished reaction image`,
      `Character: ${item.character} as the hero`,
      `Sentiment: ${analysis.emotion}, ${analysis.intent}, ${analysis.tone}`,
      `Art style: ${item.artStyle} - professional, illustration quality`,
      `Composition: Balanced, visually striking, gallery-quality artwork`,
      `Color palette: Rich, cohesive, emotionally resonant`,
      `Setting: Contextual environment that enhances the reaction`,
      `Quality: Detailed, high-resolution, suitable for printing or display`
    ].join(". ");
  }

  return [
    `Create a ${String(item.kind).toLowerCase()} reaction visual for: "${phrase}"`,
    `Character: ${item.character}`,
    `Style: ${item.artStyle}`,
    `Emotion: ${analysis.emotion}`,
    `Tone: ${analysis.tone}`,
    "High quality, social-media ready, expressive and polished."
  ].join(". ");
}

async function generateCloudinaryAsset(prompt: string, format: "png" | "gif") {
  const remoteUrl = await generateImageWithDALLE(prompt);
  if (!remoteUrl) {
    return null;
  }

  if (!hasCloudinaryConfig()) {
    return {
      mediaUrl: remoteUrl,
      downloadUrl: remoteUrl,
      mimeType: format === "gif" ? "image/gif" : "image/png"
    };
  }

  const uploaded = await uploadRemoteAssetToCloudinary(remoteUrl, "saysee");
  if (!uploaded) {
    return {
      mediaUrl: remoteUrl,
      downloadUrl: remoteUrl,
      mimeType: format === "gif" ? "image/gif" : "image/png"
    };
  }

  const deliveredUrl = buildCloudinaryDeliveryUrl(uploaded.publicId, format);
  return {
    mediaUrl: deliveredUrl,
    downloadUrl: deliveredUrl,
    mimeType: format === "gif" ? "image/gif" : "image/png",
    publicId: uploaded.publicId
  };
}

// Full animated-GIF pipeline: phrase -> animation spec -> Sora video -> looping GIF.
async function generateAnimatedGif(
  phrase: string,
  context?: AnimationContext
): Promise<{ mediaUrl: string; downloadUrl: string; mimeType: string; publicId?: string } | null> {
  const spec = await generateAnimationSpec(phrase, context);
  if (!spec) {
    return null;
  }

  const soraPrompt = buildSoraPrompt(spec, phrase, context);
  const video = await generateVideoWithSora(soraPrompt);
  if (!video) {
    return null;
  }

  if (hasCloudinaryConfig()) {
    const uploaded = await uploadVideoBufferToCloudinary(video.bytes, "saysee");
    if (uploaded) {
      const deliveredUrl = buildCloudinaryVideoGifUrl(uploaded.publicId);
      console.log(`✓ GIF ready (looping Cloudinary .gif): ${deliveredUrl}`);
      return {
        mediaUrl: deliveredUrl,
        downloadUrl: deliveredUrl,
        mimeType: "image/gif",
        publicId: uploaded.publicId
      };
    }
  }

  // No Cloudinary (or upload failed): inline the MP4 so the <video> tag can loop it.
  console.warn("⚠ GIF falling back to inline MP4 (Cloudinary unavailable) — looping via <video> tag");
  const dataUrl = `data:${video.mimeType};base64,${video.bytes.toString("base64")}`;
  return { mediaUrl: dataUrl, downloadUrl: dataUrl, mimeType: video.mimeType };
}

async function attachMediaToOutput(
  phrase: string,
  analysis: Analysis,
  item: ReactionItem,
  fallbackImageUrl?: string,
  context?: AnimationContext
) {
  const prompt = buildVisualPrompt(phrase, analysis, item);

  if (item.kind === "GIF") {
    // Try a real animated clip first.
    const animated = await generateAnimatedGif(phrase, context);
    if (animated) {
      return { ...item, ...animated, isGenerated: true };
    }

    // Sora unavailable/failed: fall back to the still-image frame (served as a .gif).
    if (fallbackImageUrl) {
      if (!hasCloudinaryConfig()) {
        return {
          ...item,
          mediaUrl: fallbackImageUrl,
          downloadUrl: fallbackImageUrl,
          mimeType: "image/gif",
          isGenerated: true
        };
      }

      const uploaded = await uploadRemoteAssetToCloudinary(fallbackImageUrl, "saysee");
      if (uploaded) {
        const deliveredUrl = buildCloudinaryDeliveryUrl(uploaded.publicId, "gif");
        return {
          ...item,
          mediaUrl: deliveredUrl,
          downloadUrl: deliveredUrl,
          mimeType: "image/gif",
          publicId: uploaded.publicId,
          isGenerated: true
        };
      }
    }
  }

  const asset = await generateCloudinaryAsset(prompt, item.kind === "GIF" ? "gif" : "png");
  if (!asset) {
    return item;
  }

  return {
    ...item,
    mediaUrl: asset.mediaUrl,
    downloadUrl: asset.downloadUrl,
    mimeType: asset.mimeType,
    publicId: asset.publicId,
    isGenerated: true
  };
}

export async function generateReactionPack(phrase: string, selectedTypes: string[] = []): Promise<GenerationResult> {
  const base = generateReactions(phrase);

  const typesToGenerate = selectedTypes.length > 0 ? selectedTypes : ["Sticker", "GIF", "Meme", "Image"];
  const filteredOutputs = base.outputs.filter((item) => typesToGenerate.includes(item.kind));

  if (!hasOpenAIKey()) {
    return {
      analysis: base.analysis,
      outputs: filteredOutputs
    };
  }

  let analysis = base.analysis;
  let context: AnimationContext | undefined;

  try {
    const aiAnalysis = await analyzeWithGPT(phrase);
    analysis = normalizeAnalysis(base.analysis, aiAnalysis);
    // Carry the detected language + English meaning into the animation pipeline.
    context = { language: aiAnalysis.language, meaning: aiAnalysis.meaning, emotion: aiAnalysis.emotion };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log(`ℹ Skipping AI emotion analysis, using fallback: ${msg.substring(0, 60)}`);
  }

  const enrichedBaseOutputs = filteredOutputs.map((item) => {
    if (item.kind === "Sticker") {
      return { ...item, artStyle: analysis.tone || item.artStyle };
    }

    return item;
  });

  const stickerBase = enrichedBaseOutputs.find((item) => item.kind === "Sticker") ?? enrichedBaseOutputs[0];
  const stickerPrompt = buildVisualPrompt(phrase, analysis, stickerBase);
  const stickerAsset = await generateCloudinaryAsset(stickerPrompt, "png");

  const outputs: ReactionItem[] = [];
  for (const item of enrichedBaseOutputs) {
    if (item.kind === "Sticker" && stickerAsset) {
      outputs.push({
        ...item,
        mediaUrl: stickerAsset.mediaUrl,
        downloadUrl: stickerAsset.downloadUrl,
        mimeType: stickerAsset.mimeType,
        publicId: stickerAsset.publicId,
        isGenerated: true
      });
      continue;
    }

    const output = await attachMediaToOutput(phrase, analysis, item, stickerAsset?.mediaUrl, context);
    outputs.push(output);
  }

  return {
    analysis,
    outputs
  };
}