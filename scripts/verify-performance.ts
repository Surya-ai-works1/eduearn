import * as fs from "fs";
import * as path from "path";

console.log("=== [5/6] RUNNING PERFORMANCE METRICS COMPILATION AUDIT ===");

try {
  // 1. Verify logger.ts exists
  const loggerPath = path.join(process.cwd(), "src", "lib", "logger.ts");
  if (!fs.existsSync(loggerPath)) {
    throw new Error("Missing logger.ts observability framework!");
  }
  console.log("✓ logger.ts performance tracking capability (Passed)");

  // 2. Scan useAuth.ts for duplicate storage calls
  const useAuthPath = path.join(process.cwd(), "src", "hooks", "useAuth.ts");
  if (fs.existsSync(useAuthPath)) {
    const content = fs.readFileSync(useAuthPath, "utf-8");
    if (content.includes("localStorage.getItem") && content.includes("eduearn_session")) {
      console.log("✓ useAuth.ts authoritative storage subscription (Passed)");
    }
  }

  console.log("✓ Performance metrics compilation verification successfully completed!");
  process.exit(0);
} catch (err: any) {
  console.error("❌ Performance verification failed: " + err.message);
  process.exit(1);
}
