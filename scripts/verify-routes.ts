import * as fs from "fs";
import * as path from "path";

console.log("=== [2/6] RUNNING ROUTING PATHS VERIFICATION AUDIT ===");

const criticalRoutes = [
  "admin/dashboard",
  "tutor/dashboard",
  "student/dashboard",
  "login",
  "register",
  "welcome",
  "api/system/health"
];

try {
  const appDir = path.join(process.cwd(), "src", "app");
  if (!fs.existsSync(appDir)) {
    throw new Error("Missing src/app application route directory!");
  }

  for (const route of criticalRoutes) {
    const routePath = path.join(appDir, route);
    if (!fs.existsSync(routePath)) {
      throw new Error(`Critical route path does not exist: src/app/${route}`);
    }
    console.log(`✓ Route path check: src/app/${route} (Passed)`);
  }

  console.log("✓ Route paths verification successfully completed!");
  process.exit(0);
} catch (err: any) {
  console.error("❌ Routing verification failed: " + err.message);
  process.exit(1);
}
