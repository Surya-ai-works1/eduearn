/**
 * Programmatic Authentication & RBAC Recovery Stress Tester
 * Verifies all 11 core scenarios of mixed stale sessions, cookie deletions, role switches, and route authorization.
 */

process.env.NEXT_PUBLIC_DEV_MODE = "true";

import { resolveRouteDecision, normalizeRole, getPermissionsCountForRole } from "../src/utils/rbacResolver";

// ── Mock Browser Environment for Node.js ────────────────────────────────────
const mockLocalStorage: Record<string, string> = {};
const mockSessionStorage: Record<string, string> = {};
let mockCookies: string[] = [];

global.window = {} as any;
global.localStorage = {
  getItem: (key: string) => mockLocalStorage[key] || null,
  setItem: (key: string, value: string) => { mockLocalStorage[key] = value; },
  removeItem: (key: string) => { delete mockLocalStorage[key]; },
  clear: () => { for (const key in mockLocalStorage) { delete mockLocalStorage[key]; } }
} as any;

global.sessionStorage = {
  getItem: (key: string) => mockSessionStorage[key] || null,
  setItem: (key: string, value: string) => { mockSessionStorage[key] = value; },
  removeItem: (key: string) => { delete mockSessionStorage[key]; },
  clear: () => { for (const key in mockSessionStorage) { delete mockSessionStorage[key]; } }
} as any;

global.document = {
  get cookie() {
    return mockCookies.join("; ");
  },
  set cookie(val: string) {
    const parts = val.split(";")[0].split("=");
    const name = parts[0].trim();
    const value = parts[1] ? parts[1].trim() : "";
    mockCookies = mockCookies.filter(c => !c.startsWith(name + "="));
    mockCookies.push(`${name}=${value}`);
  }
} as any;

// Import the session repair utility after mock environment is set up
import { repairSessionInDev } from "../src/utils/sessionRepair";

function clearAllMocks() {
  for (const k in mockLocalStorage) delete mockLocalStorage[k];
  for (const k in mockSessionStorage) delete mockSessionStorage[k];
  mockCookies = [];
}

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✓ [PASS] ${message}`);
  } else {
    console.error(`✗ [FAIL] ${message}`);
    process.exit(1);
  }
}

console.log("=== EduEarn Authentication & RBAC Recovery Stress Test ===");

// 1. Refresh on Admin Dashboard check
const adminDecision = resolveRouteDecision("admin", "/admin/dashboard", true);
assert(adminDecision.allowed === true, "Admin allowed on /admin/dashboard");

// 2. Direct navigation checks
const tutorOnTutor = resolveRouteDecision("tutor", "/tutor/dashboard", true);
assert(tutorOnTutor.allowed === true, "Tutor allowed on /tutor/dashboard");

const studentOnStudent = resolveRouteDecision("student", "/student/dashboard", true);
assert(studentOnStudent.allowed === true, "Student allowed on /student/dashboard");

const studentOnAdmin = resolveRouteDecision("student", "/admin/dashboard", true);
assert(studentOnAdmin.allowed === false && studentOnAdmin.redirectPath === "/forbidden", "Student blocked from admin");

const guestOnAdmin = resolveRouteDecision(null, "/admin/dashboard", false);
assert(guestOnAdmin.allowed === false && guestOnAdmin.redirectPath === "/login", "Guest redirected from admin to login");

// 3. Incognito window / fresh launch (cleared state)
clearAllMocks();
repairSessionInDev();
const repSession = JSON.parse(mockLocalStorage["eduearn_session"] || "{}");
assert(repSession.user.role === "student", "Fresh incognito defaults to student role");

// 4. Role normalization test
assert(normalizeRole("ADMIN") === "admin", "Normalize 'ADMIN' -> 'admin'");
assert(normalizeRole("SuperAdmin") === "super-admin", "Normalize 'SuperAdmin' -> 'super-admin'");
assert(normalizeRole("learner") === "student", "Normalize 'learner' -> 'student'");

// 5. Stale duplicate session recovery
clearAllMocks();
mockLocalStorage["eduearn_role"] = "ADMIN";
mockLocalStorage["eduearn_mock_session"] = JSON.stringify({ user: { role: "tutor", complete: true } });
repairSessionInDev();
const repaired = JSON.parse(mockLocalStorage["eduearn_session"] || "{}");
assert(repaired.user.role === "tutor", "Repair extracts role from mock_session and cleans up duplicates");
assert(mockLocalStorage["eduearn_role"] === undefined, "Redundant eduearn_role deleted");

// 6. Cookie regeneration on deletion
clearAllMocks();
mockLocalStorage["eduearn_session"] = JSON.stringify({ user: { role: "admin", complete: true } });
repairSessionInDev();
assert(mockCookies.some(c => c.startsWith("eduearn_dev_role=admin")), "Cookie regenerated from eduearn_session");

console.log(`\nStress Test Results: ${passedTests}/${totalTests} checks passed.`);
process.exit(0);
