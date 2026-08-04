import { execSync } from "child_process";
import * as path from "path";

console.log("=================================================================");
console.log("   EduEarn Enterprise SaaS Platform - Integrated QA Test Suite   ");
console.log("=================================================================\n");

const testScripts = [
  "verify-build.ts",
  "verify-routes.ts",
  "verify-rbac.ts",
  "verify-storage.ts",
  "verify-performance.ts",
  "verify-production.ts"
];

let allPassed = true;

for (let i = 0; i < testScripts.length; i++) {
  const script = testScripts[i];
  const scriptPath = path.join(process.cwd(), "scripts", script);
  
  try {
    // Run script synchronously and print output
    execSync(`npx ts-node ${scriptPath}`, { stdio: "inherit" });
    console.log(""); // newline separator
  } catch (err) {
    console.error(`❌ Verification failed on script: ${script}\n`);
    allPassed = false;
    break;
  }
}

if (allPassed) {
  console.log("=================================================================");
  console.log("   ✓ ALL ENTERPRISE DEPLOYMENT READINESS VERIFICATIONS PASSED!   ");
  console.log("   EduEarn is officially ready for Production Deployments.       ");
  console.log("=================================================================");
  process.exit(0);
} else {
  console.log("=================================================================");
  console.log("   ❌ ONE OR MORE VERIFICATION CHECKPOINTS FAILED!               ");
  console.log("   Please review execution logs above and fix structural errors. ");
  console.log("=================================================================");
  process.exit(1);
}
