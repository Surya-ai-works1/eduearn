import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  const apiValid = !!(apiKey && apiKey.trim().length > 0 && apiKey !== "undefined");
  const senderValid = !!(senderEmail && senderEmail.trim().length > 0 && senderEmail !== "undefined");

  return NextResponse.json({
    brevoConfigured: apiValid && senderValid,
    apiKeyPresent: apiValid,
    senderConfigured: senderValid,
    templateConfigured: true,
  });
}
