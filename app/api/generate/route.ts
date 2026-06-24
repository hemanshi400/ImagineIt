import { NextResponse } from "next/server";
import { generateReactionPack } from "@/lib/generation-service";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { phrase?: string } | null;
  const phrase = body?.phrase?.trim();

  if (!phrase) {
    return NextResponse.json({ error: "Phrase is required." }, { status: 400 });
  }

  try {
    const data = await generateReactionPack(phrase);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Generation API error:", error);
    return NextResponse.json({ error: "Could not generate reaction pack." }, { status: 500 });
  }
}
