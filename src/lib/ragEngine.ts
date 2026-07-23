import { createClient } from "./supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface DocumentSection {
  id: string;
  course_id: string;
  content: string;
  similarity?: number;
  metadata: {
    lesson_id?: string;
    subject?: string;
    chapter?: string;
    topic?: string;
    class_level?: string;
    category?: string;
    language?: string;
    uploaded_by?: string;
    created_at?: string;
  };
}

export const RAGEngine = {
  /**
   * Helper to generate text embeddings using Gemini 1.5 text-embedding-004
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text);
    
    if (result.embedding?.values) {
      return result.embedding.values;
    }
    throw new Error("Failed to retrieve embedding values from Gemini.");
  },

  /**
   * Simple Recursive Character Text Chunker with Overlap
   */
  chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
    const chunks: string[] = [];
    let start = 0;
    
    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      chunks.push(text.substring(start, end));
      start += chunkSize - overlap;
    }
    
    return chunks;
  },

  /**
   * Document Ingestion Pipeline: Chunks document, generates embeddings, and saves to pgvector.
   */
  async ingestDocument(
    courseId: string,
    rawText: string,
    metadata: DocumentSection["metadata"]
  ): Promise<boolean> {
    try {
      const supabase = createClient();
      const chunks = this.chunkText(rawText);

      for (const chunk of chunks) {
        const embedding = await this.generateEmbedding(chunk);
        const { error } = await supabase.from("document_sections").insert({
          course_id: courseId,
          content: chunk,
          embedding,
          metadata: {
            ...metadata,
            created_at: new Date().toISOString(),
          },
        });

        if (error) {
          console.error("Failed to insert document chunk:", error);
          throw error;
        }
      }

      return true;
    } catch (err) {
      console.error("RAG Ingestion error:", err);
      return false;
    }
  },

  /**
   * Query Pipeline: Checks user role/enrollments and fetches similarity match document sections context
   */
  async queryContext(
    userId: string,
    query: string,
    limit = 4,
    threshold = 0.5
  ): Promise<string> {
    try {
      const supabase = createClient();

      // 1. Enforce security constraints based on user role
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (profileErr || !profile) {
        throw new Error("Failed to load user profile for security validation.");
      }

      const role = profile.role;
      let filterCourseIds: string[] | null = null;

      if (role === "learner") {
        // Retrieve only enrolled courses
        const { data: enrollments, error: enrollErr } = await supabase
          .from("enrollments")
          .select("course_id")
          .eq("learner_id", userId);

        if (enrollErr || !enrollments) {
          throw new Error("Failed to load student course enrollments.");
        }
        const ids = enrollments.map((e: any) => e.course_id);
        filterCourseIds = ids;
        
        if (ids.length === 0) {
          return ""; // No enrolled courses, no context
        }
      } else if (role === "tutor") {
        // Retrieve only own courses
        const { data: courses, error: courseErr } = await supabase
          .from("courses")
          .select("id")
          .eq("tutor_id", userId);

        if (courseErr || !courses) {
          throw new Error("Failed to load tutor courses.");
        }
        const ids = courses.map((c: any) => c.id);
        filterCourseIds = ids;

        if (ids.length === 0) {
          return ""; // No courses created, no context
        }
      }

      // 2. Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(query);

      // 3. Query pgvector matching function
      const { data: matches, error: matchErr } = await supabase.rpc(
        "match_document_sections",
        {
          query_embedding: queryEmbedding,
          match_threshold: threshold,
          match_count: limit,
          filter_course_ids: filterCourseIds,
        }
      );

      if (matchErr) {
        console.error("Supabase RPC match failed:", matchErr);
        throw matchErr;
      }

      if (!matches || matches.length === 0) {
        return "";
      }

      // 4. Construct context string
      return matches.map((m: any) => m.content).join("\n\n---\n\n");
    } catch (err) {
      console.error("RAG Query failed, falling back to empty context:", err);
      return "";
    }
  },
};
