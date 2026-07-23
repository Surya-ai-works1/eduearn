import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey.includes("add your")) {
  console.warn("GEMINI_API_KEY is not configured in backend .env. Operating in warning/dry-run mode.");
}

export const aiClient = new GoogleGenAI({ apiKey: apiKey || "" });

export default aiClient;
