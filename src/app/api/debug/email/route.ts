import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  return NextResponse.json({
    brevoConfigured: !!(apiKey && apiKey.trim().length > 0),
    apiKeyPresent: !!apiKey,
    senderConfigured: !!(senderEmail && senderEmail.trim().length > 0),
    templateConfigured: true,
  });
}
