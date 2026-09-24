// src/app/api/ai/route.ts

import { NextRequest, NextResponse } from "next/server";
import { AiCompatibilityLayer } from "@/lib/ai/compatibility/AiCompatibilityLayer";
import { getApiUser } from "@/lib/apiAuth";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, 30, 60, "ai");
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `AI rate limit reached. Please wait ${rl.resetSeconds} seconds.` },
      {
        status: 429,
        headers: { "Retry-After": String(rl.resetSeconds) },
      }
    );
  }

  try {
    // Authenticate AI calls - allow any authenticated user
    const auth = await getApiUser();
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const activeUserId = auth.user.id;

    const body = await req.json();
    const { prompt, module, courseContext, systemPrompt } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const legacyResponse = await AiCompatibilityLayer.handleLegacyChat({
      prompt,
      module,
      courseContext,
      systemPrompt,
      userId: activeUserId
    });

    return NextResponse.json(legacyResponse);
  } catch (err: any) {
    console.error("API AI route error:", err);
    return NextResponse.json({ error: err.message || "AI service error" }, { status: 500 });
  }
}
