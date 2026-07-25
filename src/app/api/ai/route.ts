// src/app/api/ai/route.ts

import { NextRequest, NextResponse } from "next/server";
import { AiCompatibilityLayer } from "@/lib/ai/compatibility/AiCompatibilityLayer";
import { getApiUser } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  try {
    // Authenticate AI calls
    const auth = await getApiUser("student");
    // Fallback/Mock mode check (if unauthenticated in mock mode, bypass)
    let activeUserId = "anonymous-user";
    if (!("error" in auth)) {
      activeUserId = auth.user.id;
    }

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
