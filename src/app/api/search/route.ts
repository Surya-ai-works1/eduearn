import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

function magnitude(a: number[]): number {
  return Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
}

function cosineSimilarity(a: number[], b: number[]): number {
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(a, b) / (magA * magB);
}

export async function POST(req: NextRequest) {
  try {
    const { query, type, items } = await req.json();
    if (!query || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid query or items list" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Mock semantic search fallback sorting
      return NextResponse.json({ results: items });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

    // Generate query embedding
    const queryEmbedResult = await embeddingModel.embedContent(query);
    const queryVector = queryEmbedResult.embedding?.values;

    if (!queryVector) {
      return NextResponse.json({ error: "Failed to generate query embedding" }, { status: 500 });
    }

    // Embed all items
    const scoredItems = await Promise.all(
      items.map(async (item: any) => {
        let contentToEmbed = "";
        if (type === "tutor") {
          contentToEmbed = `${item.fullName || ""} ${item.bio || ""} ${(item.expertise || []).join(" ")}`;
        } else {
          contentToEmbed = `${item.title || ""} ${item.description || ""} ${item.subjectName || ""}`;
        }

        try {
          const itemEmbedResult = await embeddingModel.embedContent(contentToEmbed);
          const itemVector = itemEmbedResult.embedding?.values;
          if (itemVector) {
            const similarity = cosineSimilarity(queryVector, itemVector);
            return { item, similarity };
          }
        } catch (e) {
          console.warn("Failed to embed item:", e);
        }
        return { item, similarity: 0 };
      })
    );

    // Sort by similarity descending
    const sorted = scoredItems
      .sort((a, b) => b.similarity - a.similarity)
      .map(x => x.item);

    return NextResponse.json({ results: sorted });
  } catch (err: any) {
    console.error("Semantic search route error:", err);
    return NextResponse.json({ error: "Failed to perform semantic search" }, { status: 500 });
  }
}
