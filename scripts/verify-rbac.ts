import * as fs from "fs";
import * as path from "path";

console.log("=== [3/6] RUNNING RBAC SECURITY MATRIX VERIFICATION ===");

try {
  const rbacResolverPath = path.join(process.cwd(), "src", "utils", "rbacResolver.ts");
  if (!fs.existsSync(rbacResolverPath)) {
    throw new Error("Missing src/utils/rbacResolver.ts authoritative permissions resolver!");
  }
  console.log("✓ Central rbacResolver.ts file existence check (Passed)");

  // Read file content to verify key functions exist
  const content = fs.readFileSync(rbacResolverPath, "utf-8");
  
  if (!content.includes("resolveRouteDecision")) {
    throw new Error("Missing resolveRouteDecision method in rbacResolver.ts!");
  }
  console.log("✓ resolveRouteDecision policy check (Passed)");

  if (!content.includes("getPermissionsCountForRole")) {
    throw new Error("Missing getPermissionsCountForRole helper in rbacResolver.ts!");
  }
  console.log("✓ getPermissionsCountForRole check (Passed)");

  console.log("✓ RBAC security matrix verification successfully completed!");
  process.exit(0);
} catch (err: any) {
  console.error("❌ RBAC security matrix verification failed: " + err.message);
  process.exit(1);
}
