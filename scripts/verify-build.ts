import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

console.log("=== [1/6] RUNNING BUILD VERIFICATION AUDIT ===");

try {
  // 1. Verify existence of package.json
  const pkgPath = path.join(process.cwd(), "package.json");
  if (!fs.existsSync(pkgPath)) {
    throw new Error("Missing package.json file in root workspace!");
  }
  console.log("✓ package.json check (Passed)");

  // 2. Verify next.config.ts or config files
  const configs = ["next.config.ts", "next.config.js", "next.config.mjs"];
  const configExists = configs.some(c => fs.existsSync(path.join(process.cwd(), c)));
  if (!configExists) {
    throw new Error("Missing Next.js configuration settings!");
  }
  console.log("✓ Next.js config check (Passed)");

  // 3. Verify src/proxy.ts exists
  const proxyPath = path.join(process.cwd(), "src", "proxy.ts");
  if (!fs.existsSync(proxyPath)) {
    throw new Error("Missing src/proxy.ts edge middleware delegator file!");
  }
  console.log("✓ Middleware proxy.ts check (Passed)");

  console.log("✓ Build verification successfully completed!");
  process.exit(0);
} catch (err: any) {
  console.error("❌ Build verification failed: " + err.message);
  process.exit(1);
}
