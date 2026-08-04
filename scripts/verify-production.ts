import * as fs from "fs";
import * as path from "path";

console.log("=== [6/6] RUNNING PRODUCTION READY ENVIRONMENT AUDIT ===");

try {
  // 1. Verify .env.example exists
  const envExamplePath = path.join(process.cwd(), ".env.example");
  if (!fs.existsSync(envExamplePath)) {
    throw new Error("Missing .env.example configuration template!");
  }
  console.log("✓ .env.example template check (Passed)");

  // 2. Verify CHANGELOG.md exists
  const changelogPath = path.join(process.cwd(), "CHANGELOG.md");
  if (!fs.existsSync(changelogPath)) {
    throw new Error("Missing CHANGELOG.md release documentation!");
  }
  console.log("✓ CHANGELOG.md documentation check (Passed)");

  console.log("✓ Production ready environment audit successfully completed!");
  process.exit(0);
} catch (err: any) {
  console.error("❌ Production readiness audit failed: " + err.message);
  process.exit(1);
}
