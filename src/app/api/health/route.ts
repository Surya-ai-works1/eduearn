import { NextResponse } from "next/server";
import { validateEnv } from "../../../utils/env";

export async function GET() {
  const isEnvValid = validateEnv();
  const timestamp = new Date().toISOString();
  
  return NextResponse.json(
    {
      status: "UP",
      timestamp,
      environment: process.env.NODE_ENV,
      services: {
        supabaseConfigured: isEnvValid,
        monitoringPlaceholders: true,
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
