import dns from "dns";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

// Align Razorpay variables
process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "dummy_key";
process.env.RAZORPAY_SECRET = process.env.RAZORPAY_SECRET || process.env.RAZORPAY_KEY_SECRET || "dummy_secret";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  console.log("Custom DNS configured");
} catch (e) {
  console.warn("Failed to configure custom DNS:", e);
}
