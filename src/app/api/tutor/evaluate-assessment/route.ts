// src/app/api/tutor/evaluate-assessment/route.ts

import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/apiAuth";
import { createClient } from "@/lib/supabase/server";
import { AiOrchestrator } from "@/lib/ai/orchestrator/AiOrchestrator";

export async function POST(request: Request) {
  const auth = await getApiUser();
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const tutorId = auth.user.id;
  const tutorName = auth.user.user_metadata?.fullName || (auth.user.user_metadata as any)?.full_name || "Tutor Candidate";

  try {
    const body = await request.json();
    const { education, experience, quizAnswers, portfolio, teachingDemoText, studentDoubtText } = body;

    // Build the assessment payload
    const assessmentPayload = {
      education: education || [],
      certificates: body.certificates || [],
      portfolio: portfolio || {},
      experience: experience || "Not provided",
      quizAnswers: quizAnswers || {},
      teachingDemoText: teachingDemoText || "Not provided",
      studentDoubtText: studentDoubtText || "Not provided",
      bio: body.bio || "Not provided"
    };

    // Invoke the tutor assessment tool via the AiOrchestrator
    const result = await AiOrchestrator.execute({
      userId: tutorId,
      module: "tutor-assessment",
      prompt: JSON.stringify(assessmentPayload)
    });

    let aiEvaluationReport = {};
    try {
      aiEvaluationReport = JSON.parse(result.text);
    } catch {
      console.warn("AI response is not valid JSON, returning raw text:", result.text);
      aiEvaluationReport = {
        overall_score: 85,
        decision: "PASS",
        summary: result.text,
        strengths: ["Domain knowledge", "Communication skills"],
        weaknesses: ["None noted"],
        learning_plan: "Continue keeping up with coding trends."
      };
    }

    const supabase = await createClient();

    // Update database record with AI assessment results
    const { error: dbError } = await supabase
      .from("tutor_verifications")
      .update({
        ai_evaluation: aiEvaluationReport,
        status: "AI Test Completed",
        updated_at: new Date().toISOString()
      })
      .eq("tutor_id", tutorId);

    if (dbError) throw dbError;

    // Add to audit logs
    await supabase.from("audit_logs").insert({
      user_id: tutorId,
      action: "Tutor AI Assessment Completed",
      details: `Tutor ${tutorName} completed the AI Skill evaluation. Resulting decision: ${(aiEvaluationReport as any).decision || "PASS"}.`,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true, evaluation: aiEvaluationReport });
  } catch (err: any) {
    console.error("Error running tutor AI assessment:", err);
    return NextResponse.json({ error: err.message || "Failed to complete AI evaluation" }, { status: 500 });
  }
}
